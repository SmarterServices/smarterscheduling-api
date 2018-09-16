'use strict';

const _ = require('lodash');
const Https = require('https');
const sequelizeHelper = require('./utils/sequelize');
const instanceCreator = require('./db-connections/instance-creator');
const errorResponse = require('error-response');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
   * Class representing Heroku connect
   */
class HerokuConnect {
/**
   * Constructor for HerokuConnect
   * @param {Object} configurations - Configurations needed for creating sequelize instance and models
   * @param {Object} configurations.herokuConnect - Heroku connect config
   * @param {Array} configurations.databases - Database config
   * @param {Function} [configurations.errorHandler] - Optional Callback function
   */
  constructor(configurations) {

    this.herokuConnectConfig = configurations.herokuConnect;
    this.databaseConfigurations = configurations.databases;
    this.errorHandler = configurations.errorHandler
      ? configurations.errorHandler
      : (response) => Promise.reject(response);

    this.PRIMARY_CONNECTION_NO = 0;
    this.connections = [];
    this.sequelizeModels = [];

    this._init();
  }


  /**
   * Initialization function for sequelize connections and models
   */
  _init() {
    this._setAllSequelizeConnections();
    this._setSequelizeModels();
  }

  /**
   * Gets sequelize instances for all database connections
   */
  _setAllSequelizeConnections() {
    this.databaseConfigurations.forEach((configuration) => {
      this.connections.push(instanceCreator.getInstance(configuration));
    });
  }

  /**
   * Gets models for all database connections
   */
  _setSequelizeModels() {
    this.sequelizeModels = sequelizeHelper.getModels(this.databaseConfigurations, this.connections);
  }

  /**
   *
   * @param {number} connectionNo - Required connection number
   * @param {string} modelName - Name of the required model
   * @returns {Sequelize} - Sequelize Model of the respective connection
   * @private
   */
  _getModel(connectionNo, modelName) {
    this._checkConnectionNumber(connectionNo);

    if (!this.sequelizeModels[connectionNo].hasOwnProperty(modelName)) {
      return Promise.reject(errorResponse.formatError('MODEL_NOT_FOUND'));
    }

    return this.sequelizeModels[connectionNo][modelName];
  }

  /**
   * Adds data with respective to model
   * @param {string} modelName - Required model name
   * @param {Object} data - Required data
   * @param {number} data.connectionNo - Required connection number
   * @param {Object} data.payload - payload sent to the request
   * @returns {Promise} - Add data promise
   * @resolves {object} - added data
   * @rejects {Error} - database error
   */
  addData(modelName, data) {
    const _this = this;
    return new Promise(function addDataPromise(resolve, reject) {
      const connectionNo = _.get(data, 'connectionNo', 0);
      const model = _this._getModel(connectionNo, modelName);

      model
        .build(data.payload)
        .save()
        .then(function (data) {
          resolve(data.get());
        })
        .catch(function (error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Lists data with respective to model
   * @param {string} modelName - Required model name
   * @param {Object} data - Required data
   * @param {number} data.connectionNo - Required connection number
   * @param {Object} data.payload - payload sent to the request
   * @param {number} data.limit - Limit of the list data
   * @param {number} data.offset - Offset of the list data
   * @param {Array<string>} data.sortKeys - Sort keys for the list
   * @param {string} data.sortOrder - Sort order of the list
   * @param {Object} query - Query sent with the request
   * @param {Object} query.where - Condition of the query
   * @returns {Promise} - List data promise
   * @resolves {object} - List data
   * @rejects {Error} - database error
   */
  listData(modelName, data, query) {
    const _this = this;
    return new Promise(function listDataPromise(resolve, reject) {
      const connectionNo = data.connectionNo || 0;
      const model = _this._getModel(connectionNo, modelName);
      const limit = data.limit;
      const offset = data.offset || 0;
      const filter = {
        limit: limit || Number.MAX_SAFE_INTEGER,
        offset: offset,
        where: {}
      };

      if (data.sortKeys && data.sortKeys.length) {
        const sortOrder = data.sortOrder || 'ASC';
        //If data has sorting options create query
        filter.order = data.sortKeys.map(key => [key, sortOrder]);
      }

      //If custom query is provided, append that in filter
      if (query) {
        _this._mergeQueryWithSymbol(filter.where, query.where);
      }

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }


      model
        .findAndCountAll(filter)
        .then(function (data) {
          const results = data.rows;

          //prepare keyset pagination info
          const lastData = results[results.length - 1] || {};

          resolve({
            limit: limit,
            total: data.count,
            results: results.map(val => val.get())
          });
        })
        .catch(function (error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  /**
   * Gets a row from database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions={}] - Sequelize query options for findOne
   * @returns {Promise} - Add account promise
   * @resolves {Object} - result data
   * @rejects {Error} - Database error
   */
  getData(modelName, data, queryOptions = {}) {
    const _this = this;
    return new Promise(function addAccountPromise(resolve, reject) {
      const connectionNo = _.get(data, 'connectionNo', 0);
      const model = _this._getModel(connectionNo, modelName);
      const filter = {where: {}};


      if (!_this._validateParameter(data, queryOptions)) {
        return reject(errorResponse.formatError('MISSING_FILTER'));
      }

      if (_.get(data, 'sid')) {
        // if sid is provided in data
        _.set(filter, 'where.sid', data.sid);
      }

      if (queryOptions) {
        // if custom query is provided
        _this._mergeQueryWithSymbol(filter.where, queryOptions.where);
      }

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .findOne(filter)
        .then(function onUpdate(data) {
          if (data) {
            resolve(data.get());
          } else {
            reject(errorResponse.formatError('DATA_NOT_FOUND'));
          }
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  /**
   * searches for data using custom query
   * @param {string} modelName - name of the model
   * @param {Object} query - query to use for look up
   * @param {boolean} queryMultiple - true to find multiple matched data
   * @param {number} connectionNo - Connection no to use for query
   * @returns {Promise} - Query data promise
   * @resolves {Array.<Object>} data- result of query
   * @reject {Object|String} error - error while fetching data from table
   */
  queryData(modelName, query, queryMultiple, connectionNo = 0) {
    const _this = this;
    return new Promise(function addAccountPromise(resolve, reject) {
      const model = _this._getModel(connectionNo, modelName);
      let queryPromise;

      // if there is no query object or no where clause, add them
      if (!query) {
        query = {};
      }

      if (model.attributes.isDeleted) {
        _.set(query, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      if (queryMultiple) {
        queryPromise = model.findAll(query);
      } else {
        queryPromise = model.findOne(query);
      }

      queryPromise
        .then(function onUpdate(data) {
          if (!data) {
            // there is no data even if it is an array
            reject(errorResponse.formatError('DATA_NOT_FOUND'));
          } else {
            if (!Array.isArray(data)) {
              data = [data];
            }
            data = data.map(val => val.get());
            resolve(data);
          }
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  /**
   * Updates rows in database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions] - Sequelize query options for update
   * @returns {Promise} - Resolves number of rows affected
   * @rejects {Error}
   */
  updateData(modelName, data, queryOptions) {
    const _this = this;
    return new Promise(function updateDataPromise(resolve, reject) {
      const connectionNo = data.connectionNo || 0;
      const model = _this._getModel(connectionNo, modelName);
      const updateParams = data.payload;

      // We set the hooks false because it causes issues with transactions, i.e. update
      // operation is not reverted sometimes if any parallel operation fails due to rollback
      // being called before the update query is executed
      const updateFilter = {
        where: {
          isDeleted: {
            [Op.or]: [false, null]
          }
        }
      };

      if (!_this._validateParameter(data, queryOptions)) {
        return reject(errorResponse.formatError('MISSING_FILTER'));
      }

      if (_.get(data, 'sid')) {
        // if sid is provided in data
        _.set(updateFilter, 'where.sid', data.sid);
      }
      //If custom filter is provided, append that in update filter
      if (queryOptions) {
        _this._mergeQueryWithSymbol(updateFilter.where, queryOptions.where);
      }

      model
        .update(updateParams, updateFilter)
        .then(function onUpdate(data) {
          if (data.length === 1 && data[0] > 0) {
            return resolve(data);
          }

          reject(errorResponse.formatError('DATA_NOT_FOUND'));
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });


    });
  }

  /**
   * Create multiple rows in DB
   * @param {string} modelName - Name of the model in which the insertion should occur
   * @param {Object} data - Insertion data
   * @param {Array} data.payload - List of formatted row data
   * @param {Object} options - Sequelize specific options
   * @returns {Promise} - bulk create promise
   * @resolves {Object} - Created data
   * @rejects {Error} - database error
   */
  bulkCreate(modelName, data, options) {
    const _this = this;
    return new Promise(function bulkCreatePromise(resolve, reject) {
      const connectionNo = data.connectionNo || 0;
      const insertParams = data.payload;

      const model = _this._getModel(connectionNo, modelName);

      // We set the hooks false because it causes issues with transactions, i.e. bulkCreate
      // operation is not reverted sometimes if any parallel operation fails due to rollback
      // being called before the bulkCreate query is executed
      const bulkCreateOptions = Object.assign({hooks: false}, options);

      model
        .bulkCreate(insertParams, bulkCreateOptions)
        .then(function onUpdate(data) {
          resolve({
            results: data.map(val => val.get())
          });
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });


    });
  }


  /**
   * Deletes rows in database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions] - Sequelize query options for update
   * @returns {Promise} - Resolves number of rows affected
   * @rejects {Error}
   */
  deleteData(modelName, data, queryOptions) {
    const _this = this;
    return new Promise(function deleteAccountPromise(resolve, reject) {
      const connectionNo = _.get(data, 'connectionNo', 0);
      const model = _this._getModel(connectionNo, modelName);
      const filter = {where: {}};

      if (!_this._validateParameter(data, queryOptions)) {
        return reject(errorResponse.formatError('MISSING_FILTER'));
      }

      if (_.get(data, 'sid')) {
        // if sid is provided in data
        _.set(filter, 'where.sid', data.sid);
      }

      //If custom filter is provided, append that in update filter
      if (queryOptions) {
        _this._mergeQueryWithSymbol(filter.where, queryOptions.where);
      }

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .destroy(filter)
        .then(function onUpdate(data) {
          if (data > 0) {
            resolve();
          } else {
            reject(errorResponse.formatError('DATA_NOT_FOUND'));
          }
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          reject(error);
        });


    });
  }

  /**
   * Run a raw SQL query on DB
   * @param {string} query - Query to be executed
   * @param {Object} [options] - Sequelize raw query option
   * @param {number} [options.connectionNo] - Db connection to use
   * @returns {Promise} - Resolves query resulta after execution
   */
  runQuery(query, options = {}) {
    const _this = this;
    options = options || {};
    return new Promise(function queryPromise(resolve, reject) {
      if(options.connectionNo) {
        _this._checkConnectionNumber(options.connectionNo);
      }
      const sequelize = options.connectionNo
        ? _this.getConnection(options.connectionNo)
        : _this.getConnection();


      sequelize
        .query(query, options)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(error) {
          return _this.errorHandler(error);
        })
        .catch(error => {
          console.error(error.stack || error);
          reject(error);
        });
    });
  }

  /**
   * Gets the sequelize instance according to connection no.
   * @param {number} connectionNo - Connection number to determine which database to select
   * @returns {sequelize} - Sequelize instance of required database
   */
  getConnection(connectionNo = this.PRIMARY_CONNECTION_NO) {
    return this.connections[connectionNo];
  }

  /**
   * Gets the sequelize models according to connection no.
   * @param {number} connectionNo - Connection number to determine which database to select
   * @returns {Object} - Contains the models of the required connection
   */
  getModels(connectionNo = this.PRIMARY_CONNECTION_NO) {
    return this.sequelizeModels[connectionNo];
  }

  /**
   * Validates parameter
   * @param {{sid: string}} data - Required data
   * @param {Object} filter - custom filter to use for query
   * @returns {boolean} - true if sid or filter is passed
   */
  _validateParameter(data, filter) {
    //if both data.sid and filter is not provided, return false
    if ((!data || !data.sid) && (!filter || Object.keys(filter).length < 1)) {
      return false;
    }
    return true;
  }

  /**
   * Check if connection number is valid
   * @param {number} connectionNo - Required connection number
   */
  _checkConnectionNumber(connectionNo) {
    if (connectionNo < 0 || connectionNo >= this.connections.length) {
      throw new Error('Invalid Connection Number!');
    }
  }

  /**
 * Merges additionalQuery into query with Symbol
 * @param {Object} whereQuery - The 'where' query where the value will be set
 * @param {Object} additionalQuery - Extra query to merge
 */
  _mergeQueryWithSymbol(whereQuery, additionalQuery) {

    if (!additionalQuery) {
      return;
    }

    //set Symbol if the top layer has it
    this._setSymbol(whereQuery, additionalQuery);

    //merge every field`
    _.merge(whereQuery, additionalQuery);

    //iterate through the fiels and merge the Symbols as lodash.merge doesn't merge Symbol
    Object.keys(additionalQuery).map((fieldName) => {
      const queryField = additionalQuery[fieldName];
      this._setSymbol(whereQuery, queryField, fieldName);
    });
  }

  /**
 * Sets Symbol with value on the whereQuery from the queryField
 * @param {Object} whereQuery - The query where it needs to be merged
 * @param {Object} queryField - The queryField that has Symbol as key and option as value
 * @param {string} [fieldName] - Name of the field for the Symbol
 */
  _setSymbol(whereQuery, queryField, fieldName) {
    if (!queryField) {
      return;
    }
    Object.getOwnPropertySymbols(queryField).map((itemSymbol)=> {
      if (fieldName) {
        whereQuery[fieldName][itemSymbol] = queryField[itemSymbol];
      } else {
        whereQuery[itemSymbol] = queryField[itemSymbol];
      }

    });
  }

};

module.exports = HerokuConnect;
