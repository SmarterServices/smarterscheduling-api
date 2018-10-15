'use strict';

const _ = require('lodash');

const herokuData = require('../middleware/db-connection');
const utils = require('./../helpers/utils');

const exclusionService = {

  /**
   * Add exclusion service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addExclusion(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('exclusion', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List exclusion service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listExclusion(data) {
    const queryOptions = [['schedulingAccountSid', 'accountSid'], ['schedulingLocationSid', 'locationSid'], ['scheduleSid']];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('exclusion', data, query)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get exclusion service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getExclusion(data) {
    const getCondition = [
      ['sid', 'params.exclusionSid'],
      ['schedulingAccountSid', 'params.accountSid']
    ];
    const getQuery = {
      where: utils.getSequelizeCondition(getCondition, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('exclusion', data, getQuery)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update exclusion service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateExclusion(data) {
    const updateCondition = [
      ['sid', 'params.exclusionSid'],
      ['schedulingAccountSid', 'params.accountSid']
    ];
    const updateQuery = {
      where: utils.getSequelizeCondition(updateCondition, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('exclusion', data, updateQuery)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        if (error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code) {
          const options = {
            values: {
              exclusionSid: data.params.exclusionSid,
              schedulingAccountSid: data.params.accountSid
            }
          };
          error = errorResponse.formatError('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', options);
        } else {
          console.error(error.stack || error);
        }
        return Promise.reject(error);
      });
  },

  /**
   * Delete exclusion service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteExclusion(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('exclusion', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Format exclusion payload and include missing fields
   * @param {Object} data - Data from request
   * @returns {Object} - Re-formatted payload
   */
  formatExclusionUpdatePayload(data) {
    if (!_.get(data, 'payload.endDate')) {
      data.payload.endDate = '2070-01-01';
    }

    return Promise.resolve(data);
  }
};

module.exports = exclusionService;
