'use strict';
const herokuData = require('./../middleware/db-connection');
const utils = require('./../helpers/utils');

const locationService = {

  /**
   * Add location service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addLocation(data) {
    data.payload.schedulingAccountSid = data.params.accountSid;

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('location', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List location service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listLocation(data) {
    const queryOptions = [['schedulingAccountSid', 'params.accountSid'], ['externalId', 'query.externalId']];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('location', data.query, query)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get location service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getLocation(data) {
    const queryOptions = [['schedulingAccountSid', 'accountSid']];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('location', data, query)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        if (error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code) {
          const options = {
            values: {
              locationSid: data.sid || data.locationSid
            }
          };
          error = errorResponse.formatError('LOCATION_NOT_FOUND', options);
        } else {
          console.error(error.stack || error);
        }
        return Promise.reject(error);
      });
  },

  /**
   * Update location service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateLocation(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('location', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete location service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteLocation(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('location', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  }
};

module.exports = locationService;
