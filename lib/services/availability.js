'use strict';
const herokuData = require('./../middleware/heroku-connect');

const availabilityService = {

  /**
   * Add availability service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @return {Promise} - Resolves with added data
   */
  addAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List availability service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @return {Promise} - Resolves with list of data
   */
  listAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get availability service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @return {Promise} - Resolves with data that matches the criteria
   */
  getAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update availability service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @return {Promise} - Resolves with number of row that has been updated
   */
  updateAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete availability service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @return {Promise} - Resolves with number of row that has been deleted
   */
  deleteAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  }
};

module.exports = availabilityService;
