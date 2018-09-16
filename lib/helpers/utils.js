'use strict';

const moment = require('moment');
const _ = require('lodash');
const config = require('config');
const Fs = require('fs');
const mkdirp = require('mkdirp');
const NewId = require('new-id');
const Path = require('path');
const randomString = require('randomstring');
const pify = require('pify');
const url = require('url');
const JsonMapper = require('./json-mapper');
const templateHelpers = require('./template-helpers');
const sequelizeHelper = require('./sequelize');

const argumentValidator = require('./argument-validator/validator');
const endpointConfigurations = require('./../../config/endpoints.json');

const utils = {

  updateEndpointConfig: function (models) {
    const _this = this;
    return new Promise(function generatorPromise(resolve, reject) {
      let endpointConfigStr,
        tempModel;

      models.forEach(function forEachModel(model) {
        tempModel = model.toLowerCase();

        if (!endpointConfigurations.endpoints.find(x => x.modelName === tempModel)) {
          endpointConfigurations.endpoints.push({
            modelName: tempModel,
            path: '/applications/{applicationId}/' + tempModel + 's',
            endPointTypes: ['add', 'list', 'get', 'update', 'delete']
          });
        }
      });

      endpointConfigStr = JSON.stringify(endpointConfigurations, null, 2);

      _this.writeFile(Path.resolve(__dirname + './../../config/endpoints.json'), endpointConfigStr, {flag: 'w'})
        .then(function onResolve() {
          resolve();
        })
        .catch(function onError(ex) {
          reject(ex.stack || ex);
        });
    });
  },
  /**
   * Get an unique GUID for modelName
   * @param {string} modelName - Name of the model for getting the prefix
   * @returns {string} - ID
   */
  getNewId: function getNewId(modelName) {
    const prefixes = {
      account: 'AC',
      accountDeployment: 'AD',
      appInstall: 'AI',
      appInstallCredentials: 'IC',
      appInstallDomain: 'ID',
      appInstallIntegration: 'II',
      appInstallLedger: 'IL',
      appInstallProctorType: 'IP',
      appInstallRoleMappings: 'RM',
      application: 'AP',
      cancellationPolicy: 'CA',
      cancellationPolicyRule: 'CR',
      cancellationPolicyVersion: 'CV',
      course: 'CU',
      courseOffering: 'CO',
      enrollment: 'EN',
      enrollmentSession: 'ES',
      enrollmentSupportTicket: 'ST',
      empty: '',
      exam: 'EX',
      examConfiguration: 'EC',
      examConfigurationInstructorProctor: 'CP',
      examConfigurationProctorType: 'EP',
      examSession: 'ES',
      examSessionEventReport: 'ER',
      examSessionFee: 'SF',
      examSessionReviewPackage: 'RP',
      exportProcess: 'XP',
      eventType: 'ET',
      fundingRule: 'FR',
      messageThread: 'MT',
      messageThreadItem: 'TI',
      notification: 'NO',
      proctorAccount: 'PA',
      proctorAccountLocation: 'PL',
      proctorAccountLocationAvailability: 'LA',
      proctorAccountLocationFee: 'LF',
      proctorAccountPayment: 'PP',
      proctorAccountType: 'PT',
      proctorAccountUser: 'PU',
      proctorExportProcess: 'PX',
      proctorApprovals: 'AP',
      proctorGroup: 'PG',
      proctorGroupLocation: 'GL',
      proctorLocationType: 'LT',
      proctorSupportTicket: 'PS',
      replacement: 'RP',
      schedulingBlackoutDate: 'BD',
      timeZone: 'TZ',
      user: 'US',
      userLedger: 'UL',
      userAccommodation: 'UA',
      voucher: 'VO'
    };

    const newId = new NewId({prefixes});

    return function createId() {
      return newId.create(modelName);
    };

  },

  /**
   * Generate a random string to be used as OAuth nonce
   * @returns {string} - Random string for OAuth nonce
   */
  makeOauthNonce: function makeOauthNonce() {
    const nonceLength = 32;

    return randomString.generate({
      length: nonceLength,
      charset: 'alphanumeric'
    });
  },

  /**
   * Make the request string which will be used to generate signature
   * @param {Object} params - Params sent to the request
   * @param {string} url - Required for making the request array
   * @returns {Array} - Request array
   */
  makeRequestString: function makeRequestString(params, url) {
    const specialEncode = (string) => encodeURIComponent(string)
      .replace(/[!'()]/g, escape)
      .replace(/\*/g, '%2A');

    const paramString = Object
      .keys(params)
      .map(key => `${key}=${specialEncode(params[key])}`)
      .sort()
      .join('&');

    const requestArray = [
      'POST',
      specialEncode(url),
      specialEncode(paramString)
    ];

    return requestArray.join('&');
  },

  /**
   * Creates a map object from an array
   * @param {Array} list - An array that should be converted
   * @param {Function} keyModifier - Modifier that returns the key
   * @returns {Object} - Mapped object
   */
  getObjectMapping: function (list, keyModifier) {
    const map = {};

    list.forEach(function forEachItem(item) {
      map[keyModifier(item)] = item;
    });

    return map;
  },
  /**
   * Generates a random string
   * @param {Object} options - Options to generate the string
   * @see https://www.npmjs.com/package/randomstring#api
   * @returns {string} - A random string
   */
  generateRandomString: function generateRandomString(options) {
    options = options || {};
    return randomString.generate(options);
  },
  /**
   * Returns database table name with schema
   * This follows structure defined in Sequelize doc
   * @see http://docs.sequelizejs.com/en/2.0/api/model/#schemaschema-options-hi
   * @param {string} tableName - Name of the table
   * @param {number} [connectionNo] - Database connection to be used
   * @returns {*} - Table name
   */
  tableWithSchema: function tableWithSchema(tableName, connectionNo = 0) {
    const dialect = config.databases[connectionNo].dialect;
    const schema = config.databases[connectionNo].schema;
    if (schema) {
      if (dialect === 'postgres') {
        // following structure followed by Sequelize for 'postgres'
        return `"${schema}"."${tableName}"`;
      }
      return tableName;
    }
    return tableName;
  },

  /**
   * Returns database procedure name with schema
   * This follows structure defined in Sequelize doc
   * @see http://docs.sequelizejs.com/en/2.0/api/model/#schemaschema-options-hi
   * @param {string} procedureName - Name of procedure
   * @param {number} [connectionNo] - Database connection to be used
   * @returns {*} - Procedure name
   */
  procedureWithSchema: function procedureWithSchema(procedureName, connectionNo = 0) {
    const dialect = config.databases[connectionNo].dialect;
    const schema = config.databases[connectionNo].schema;
    if (schema) {
      if (dialect === 'postgres') {
        // following structure followed by Sequelize for 'postgres'
        return `${schema}.${procedureName}`;
      }
      return procedureName;
    }
    return procedureName;
  },

  /**
   * Builds case for SQL case query
   * @param {string} identifier - Value to mach
   * @param {string|number} value - Value to be used
   * @param {Array} replacement - Replacements
   * @param {boolean} [isTime] - is the value a time value
   * @returns {string} - Query string for update
   */
  getQueryCase: function (identifier, value, replacement, isTime) {
    const identifierReplacement = this.getNewId('replacement')();
    const valueReplacement = this.getNewId('replacement')();

    replacement[identifierReplacement] = identifier;
    replacement[valueReplacement] = value;

    let updateString = `WHEN :${identifierReplacement} THEN :${valueReplacement}`;
    if (isTime) {
      updateString += '::timestamp ';
    } else {
      updateString += ' ';
    }
    return updateString;
  },
  /**
   * build conditional statement for raw query
   * @param {Object} values - takes the values to of conditional
   * @param {Object} columns - takes the column names of conditional
   * @param {boolean} [first] - specifies if the conditionals are at the beginning
   * @returns {string} -
   */
  buildConditional: function buildConditional(values, columns, first) {
    let result = '';
    for (const key in columns) {
      if (values[key]) {
        if (Array.isArray(values[key])) {
          //if values is array, use 'IN'
          result += ` and ${columns[key]} IN `;
          //join array of values
          result += '(\'' + values[key].join('\', \'') + '\')';
        } else {
          result += ` and ${columns[key]} = '${values[key]}'`;
        }
      }
    }
    // If these are first conditionals then remove the leading 'and'
    if (first) {
      result.slice(4);
    }
    return result;
  },
  /**
   * Converts a given date into unix timestamp
   * @param {Date} date - Date to be converted
   * @returns {number} timestampDate
   */
  convertTimeToTimestamp(date) {
    //convert to timestamp
    const timestampDate = new Date(date).getTime();
    return timestampDate;
  },
  /**
   * Calls a callback function and returns data as promise
   * @param {string} funcName - function to call
   * @param {Object} data - data as parameter
   * @returns {Promise} - Resolves required response
   */
  convertCallbackToPromise: function (funcName, data) {
    return new Promise(function convertPromise(resolve, reject) {
      funcName(data, function (err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Wrap validation promises to run in parallel but return the first error message
   * @param {Array} validationPromises - List of promises that is used for validation
   * @returns {Promise} - Resolves with data and rejects with single error based on sequence
   */
  wrapValidation: function (validationPromises) {
    return new Promise(function validationPromise(resolve, reject) {
      const promises = [];

      validationPromises.forEach(function forEachMethod(method) {
        const promise = method
          .then(function (data) {
            return {
              success: true,
              response: data
            };
          })
          .catch(function (error) {
            return {
              success: false,
              reason: error
            };
          });

        promises.push(promise);
      });

      Promise
        .all(promises)
        .then(function onResolve(validationData) {
          const response = [];

          for (const data of validationData) {
            if (data.success) {
              response.push(data.response);
            } else {
              return Promise.reject(data.reason);
            }
          }

          resolve(response);
        })
        .catch(function onError(error) {
          reject(error);
        });
    });
  },

  /**
   * Generates string to be used inside e in query from a string
   * @param {Array} list - List of filter items
   * @returns {string} - Query string
   */
  getSqlInParams: function (list) {
    return list
      .map(item => `'${item}'`)
      .join(', ');
  },

  /**
   * Provides the date/time template that is used in payload
   * @returns {string} - Date template
   */
  dateTemplate: function dateTemplate() {
    return new Date(0).toISOString();
  },

  /**
   * Merge objects with duplicate identifier, usually returned from an SQL query
   * @param {Array<Object>} objectList - The list of objects
   * @param {string} identifier - The identifier to detect duplicate items
   * @param {Array<string>|string} propsToAggregate - The props which are to be aggregated into an Array
   * @param {boolean} makeUnique - make the items unique if passed as true
   * @returns {Array<Object>} - List of objects without duplicates
   */
  mergeDuplicateObjects: function mergeDuplicateObjects(objectList, identifier, propsToAggregate, makeUnique) {
    // If propsToAggregate is not array, move it to array
    if (!Array.isArray(propsToAggregate)) {
      propsToAggregate = [propsToAggregate];
    }
    // Map for unique objects with identifier as key
    const uniqueObjects = {};
    let item;
    let actualArray;
    let length;
    // Iterate through objectList and merge duplicates
    objectList.forEach(function merge(obj) {
      // Check if current object is in uniqueObjects
      if (Object.keys(uniqueObjects).indexOf(obj[identifier]) !== -1) {
        const uniqueObject = uniqueObjects[obj[identifier]];
        // Move all properties to aggregate into array
        propsToAggregate.forEach(function (prop) {
          //take the item to push
          item = _.get(obj, prop);
          actualArray = _.get(uniqueObject, prop, []);
          length = actualArray.length;
          if (item) {
            //assign in unique object with array
            _.set(uniqueObject, prop + `.[${length}]`, item);
          }
        });
      } else {
        // If current object is not in uniqueObjects, convert the properties to aggregate into array
        // with the value as the first item
        propsToAggregate.forEach(function (prop) {
          const item = _.get(obj, prop);
          //create the path with empty array

          _.set(obj, prop, []);
          //assigning the first item

          //If the item has no value ignore it
          if (item) {
            _.set(obj, prop + '.[0]', item);
          }
        });
        // Add it to uniqueObjects
        uniqueObjects[obj[identifier]] = obj;
      }
    });
    const mergedArray = [];
    // Iterate through
    Object.keys(uniqueObjects).forEach(function (key) {

      if (makeUnique) {
        //make the elements of that array unique
        propsToAggregate.forEach(function (prop) {
          let itemArray = _.get(uniqueObjects[key], prop);
          itemArray = _.uniqWith(itemArray, _.isEqual);
          _.set(uniqueObjects[key], prop, itemArray);
        });
      }


      mergedArray.push(uniqueObjects[key]);
    });
    return mergedArray;
  },

  /**
   * Replaces '*' with '%' in the values of given object/string
   * @param {string | Object} data - Required data to be converted
   * @returns {string | Object} - Converted data
   */
  replaceForLike: function replaceForLike(data) {
    //pattern to search for
    const pattern = /\*/gm;
    //replace with '%'
    const replaceValue = '%';
    // If data is string return the replaced string
    if (typeof data === 'string') {
      return data.replace(pattern, replaceValue);
    } else {
      // Otherwise replace for each value in object
      for (const item in data) {
        if (item in data && typeof data[item] === 'string') {
          data[item] = data[item].replace(pattern, replaceValue);
        }
      }
      return data;
    }
  },
  /**
   * Returns true if the checkDate is in between of given range
   * @param {Date | string} startDate - Start date
   * @param {Date | string} endDate - End date
   * @param {string} checkDate - ISO String Date to check
   * @param {string} [inclusivity] - should check equality or not
   * @returns {boolean} true - if date is in range
   */
  isDateBetween: function isDateBetween(startDate, endDate, checkDate, inclusivity = '()') {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    checkDate = new Date(checkDate);

    return moment(checkDate).isBetween(startDate, endDate, null, inclusivity);
  },

  /**
   * Returns true if the checkDate is after referenceDate
   * @param {Date} checkDate - Date to be checked
   * @param {Date} referenceDate - Default is set to now
   * @returns {boolean} true = if the date is in future
   */
  isDateAfter: function isDateAfter(checkDate, referenceDate = new Date()) {
    // changes the referenceDate to Date type if it is a string type
    if (typeof referenceDate === 'string') {
      referenceDate = new Date(referenceDate);
    }

    checkDate = new Date(checkDate);
    return checkDate > referenceDate;
  },
  /**
   * returns an sql string that gets "attemptsRemaining" based on configuration for enrollment
   * @param {Object} data - Required data
   * @param {string} data.table - name of the examConfiguration table
   * @param {string} [data.enrollmentSid] - sid of enrollment
   * @param {string} [data.ENTable] - name of table with property to compare with
   * @returns {string} sqlString - the string that should be used
   */
  getAttemptRemainingSql: function getAttemptRemainingSql(data) {
    let enrollmentCondition = '\'\'';
    if (data.enrollmentSid) {
      enrollmentCondition = `'${data.enrollmentSid}'`;
    } else if (data.ENTable) {
      enrollmentCondition = `${data.ENTable}`;
    }

    const sqlString = `
            ${data.table}.attempts_allowed__c -(
              select
                count(*)
              from
                ${this.tableWithSchema('sp_exam_session__c')} as ESCount
              where 0=0
                and (
                  ESCount.status_reason__c = 'exam-completed'
                  OR
                  ESCount.status__c = 'Scheduled'
                  )
                and ESCount.exam__r__sid__c = ${data.table}.exam__r__sid__c
                and ESCount.enrollment__r__sid__c = ${enrollmentCondition}
            ) `;
    return sqlString;
  },

  /**
   * Get week range for a specific day
   * @param {Date} date - Date for week range
   * @returns {{weekStart: *, weekEnd: *}} - Week range
   */
  getWeekRange: function getWeekRange(date) {
    const weekStart = moment(date).weekday(0);
    const weekEnd = moment(date).weekday(7);

    weekStart.hour(0);
    weekStart.minute(0);
    weekStart.second(0);


    weekEnd.hour(0);
    weekEnd.minute(0);
    weekEnd.second(0);

    return {weekStart, weekEnd};
  },

  /**
   * Wraps a query by denseRank
   * @param {Object} data - Required data
   * @param {string} data.query - query to wrap with denseRank
   * @param {string} data.identifier - identifier to use in denseRank
   * @param {number} data.limit - limit to use
   * @param {Array<string>} data.sortKeys - The custom sortKeys to use in order by query
   * @param {Object} data.sortKeyMap - The map for the string to be used in query for the provided sortKey
   * @param {string} data.sortOrder - The sorting order. Valid values are 'ASC' and 'DESC'
   * @returns {string} query - wrapped query
   */
  wrapLimit: function wrapLimit(data) {
    // Set the identifier as default sorting field
    let orderByString = data.identifier;
    if (data.sortKeys && data.sortKeys.length) {
      if (!data.sortKeyMap) {
        console.warn('A sortKeyMap property should be provided in parameter object.');
      } else {
        const sortOrder = data.sortOrder || 'ASC';
        orderByString = data.sortKeys
          .map(sortKey => `${data.sortKeyMap[sortKey]} ${sortOrder}`)
          .join(',')
          .concat(`, ${data.identifier} ${sortOrder}`);
      }
    }

    if (!(data.limit || data.sortKeys)) {
      return data.query;
    } else if (data.sortKeys && data.sortKeys.length && !data.limit) {
      return `${data.query} order by ${orderByString}`;
    } else {
      let query = data.query;
      const replacer = new RegExp('select', 'i');
      const denseBefore = `SELECT * FROM (SELECT
                    dense_rank() OVER (ORDER BY ${orderByString}) as "denseRank",
                    `;
      const denseAfter = ' ) AS rankedResult ';
      const limitQuery = 'WHERE rankedResult."denseRank" <= :limit ';

      //replace select
      query = query.replace(replacer, denseBefore);

      //add after and limit
      query = query + denseAfter + limitQuery;

      return query;
    }
  },

  /**
   * Read SQL file and replace the placeholders
   * @param {string} filePath - Absolute Path to the sql file
   * @param {Array} replacements - Array containing placeholder replacements
   * @returns {Promise} - Resolves required query
   */
  readSQLFile: function readSQLFile(filePath, replacements) {
    let query = '';
    return new Promise(function readFile(resolve, reject) {
      Fs.readFile(filePath, 'UTF-8', function (error, data) {
        if (error) {
          reject(error);
        } else {
          query = data;
          replacements.forEach(function forEach(replacement) {
            const pattern = new RegExp(replacement.placeholder, 'gm');

            query = query.replace(pattern, replacement.value);
          });

          resolve(query);
        }
      });
    });
  },

  /**
   * Build an URL from url template
   * @param {string} urlTemplate - Url template
   * @param {Object} params - Params required
   * @param {Object} [query] - Query for building url
   * @returns {string} - Built url
   */
  buildUrl: function (urlTemplate, params, query) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm'),
      paramNames;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      //Using hasOwnProperty because param might also have null or 0 values which might result in false
      if (paramNames && params.hasOwnProperty(paramNames[1])) {

        //Replace and update the urlTemplate
        urlTemplate = urlTemplate.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

    if (query) {
      // flag for first key
      let first = true;

      for (const queryKey in query) {
        // if first key use '?' as delimiter, '&' otherwise
        const delimiter = (first) ? '?' : '&';
        first = false;
        // append the query key-value pairs with original url
        const isObjectKey = typeof query[queryKey] === 'object';
        const queryValue = (isObjectKey) ?
          JSON.stringify(query[queryKey]) :
          query[queryKey];

        urlTemplate = urlTemplate + delimiter + queryKey + '=' + queryValue;
      }
    }

    return urlTemplate;
  },
  /**
   * Build pagination string for raw queries for list endpoints
   * @param {Object} query - The request query params
   * @param {number} query.limit - Query limit
   * @param {number} query.offset - Query offset
   * @param {Array<string>} query.sortKeys - Array of keys to sort
   * @param {string} query.sortOrder - Order of sorting
   * @param {Object} [sortKeyMap] - Mapping of queries for query.sortKeys
   * @returns {string} - Required pagination string
   */
  buildPaginationString: function buildPaginationString(query, sortKeyMap) {
    let paginationString = '';

    paginationString += this.buildOrderByQuery({
      sortKeyMap,
      sortKeys: query.sortKeys,
      sortOrder: query.sortOrder
    });

    if (query.limit) {
      paginationString += ' limit :limit';
    }
    if (query.offset) {
      paginationString += ' offset :offset';
    }
    return paginationString;
  },

  /**
   * Returns order by string based on given sortKey
   * @param {Object} data - Required data
   * @param {Array<string>} data.sortKeys - the keys to use to sort
   * @param {Array<string>} data.sortKeyMap - the map value of sortKeys
   * @param {Array<string>} data.sortOrder - the order of the sort
   * @param {string} [data.modelName]- name of the model
   * @param {string} [data.models]- list of sequelizeModels
   * @param {string} [data.prefix]- prefixName to concatenate to every sortKeyMap
   * @returns {string} - Order by query string
   */
  buildOrderByQuery: function buildOrderByQuery(data) {
    let sortKeyMap = data.sortKeyMap;
    const sortOrder = data.sortOrder || 'ASC';

    if (!sortKeyMap) {
      //if no sortKeyMap is provided
      //get the map via model
      sortKeyMap = this.getFieldNameMap(data.modelName, data.models);
    }
    if (data.prefix) {
      // add table alias or prefix for keyMap
      sortKeyMap = _.mapValues(sortKeyMap, (val) => data.prefix + val);
    }

    let orderByString = data.sortKeys
      .map(function (sortKey) {
        return `${sortKeyMap[sortKey]} ${sortOrder}`;
      })
      .join(', ');

    orderByString = ` ORDER BY ${orderByString} `;
    return orderByString;
  },
  /**
   * Returns map value of field name according to model
   * @param {string} modelName - Name of model
   * @param {Object} models - sequelize models
   * @param {string} [prefix] - any prefix to add to all field
   * @returns {Object} mappedField
   */
  getFieldNameMap: function (modelName, models) {
    const attributeMap = models[modelName].fieldAttributeMap;
    //invert key and value
    const invertedMappedField = _.invert(attributeMap);

    return invertedMappedField;
  },

  /**
   * Returns the endpoint string
   * @param {Object} request - request object of endpoint
   * @param {string} request.path - path string of request object
   * @returns {string} - endpoint string
   */
  buildEndpointString: function (request) {
    return config.rootApplication.url + request.path;
  },

  /**
   * Build a json view from template and data
   * @param {string} templatePath - The relative path of the template
   * @param {Object} data - The data to be mapped
   * @param {Function} reply - The hapi reply interface
   */
  replyJson(templatePath, data, reply) {
    const TEMPLATE_DIR = 'templates';
    const templateFullPath = process.cwd() + '/' + TEMPLATE_DIR + '/' + templatePath;
    const jsonMapper = new JsonMapper(templateHelpers.partials);
    const mapTemplate = require(templateFullPath);
    mapTemplate(jsonMapper, data);
    reply(JSON.stringify(jsonMapper.content)).type('application/json');
  },

  /**
   * Sets allowUnknown to true for joi object
   * @param {Object} route - Required route data
   * @param {Object} route.config - Configuration of route
   * @param {Object} route.config.validate - Config validation
   * @param {Object} route.config.validate.payload - Payload for validation
   */
  setAllowUnknown: function setAllowUnknown(route) {

    //if the payload is a joi object
    //allow unknown value in payload and strip them later
    const shouldAllowUnknown = _.get(route, 'config.validate.payload.isJoi') &&
      _.get(route, 'config.validate.payload._type') === 'object';

    if (shouldAllowUnknown) {

      ///get values if passed,
      //otherwise set to true by default
      const allowUnknown = _.get(route, 'config.validate.payload._settings.allowUnknown', true);
      const stripUnknown = _.get(route, 'config.validate.payload._settings.stripUnknown', true);

      route.config.validate.payload = route.config.validate.payload.options({
        allowUnknown,
        stripUnknown
      });

      //skip for array recursively
      skipStrippingUnknownFromJoiArray(route.config.validate.payload);
    }
  },

  /**
   * Deletes permission from route for development environment
   * @param {Object} route - each route object
   * @param {Object} appConfig - config object
   */
  deletePermission: function deletePermission(route, appConfig) {
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'dev-test') {
      const pathKey = route.method + route.path;
      const hasPermission = _.get(route, 'config.plugins.permissions');
      const isSkippable = !(_.get(appConfig, `forceAllowPermission.${pathKey}`));

      if (hasPermission && isSkippable) {
        delete route.config.plugins.permissions;
      }
    }
  },


  /**
   * Trim undefined properties of an object
   * @param {Object} obj - Object to trim the properties from
   * @returns {Object} - Trimmed properties
   */
  trimUndefined(obj) {
    const response = Object.assign({}, obj);

    _.forEach(response, (value, key) => {
      if (value === undefined) {
        delete response[key];
      }
    });

    return response;
  },

  parseUrl: url.parse.bind(url),
  formatUrl: url.format.bind(url),
  promisify: pify,
  createDir: mkdirp,
  now: moment,
  /**
   * Validate function arguments
   * @param {Array} args - Arguments from function
   * @param {Object} validationSchema - Custom schema definition
   */
  validateArguments: argumentValidator.validateArguments,
  /**
   * Builds where query to fit sequelize spec
   * @param {Array} filters - query options
   * @param {Object} data - Data to build the query with
   * @param {Object} [rootQuery] - Optional root query
   * @returns {Object} - An object that will fit into the sequelize where
   */
  getSequelizeCondition: sequelizeHelper.buildQuery

};

module.exports = utils;

/**
 * Recursively Sets stripUnknown to false for array under joi schema object
 * @param {Object} joiObject - a joi schema object
 * @param {Array} joiObject._inner.children - an array where each item will be joi.object or joi.string or joi.array etc
 *
 */
function skipStrippingUnknownFromJoiArray(joiObject) {
  const childrenList = joiObject._inner.children || [];
  for (const children of childrenList) {
    if (children.schema._type === 'object') {
      skipStrippingUnknownFromJoiArray(children.schema);
    } else if (children.schema._type === 'array') {
      children.schema = children.schema.options({
        stripUnknown: false,
        allowUnknown: false
      });
    }
  }
}
