'use strict';
const herokuData = require('./../middleware/db-connection');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const appointmentService = {

  /**
   * Add appointment service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addAppointment(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('appointment', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List appointment service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Object} queryOptions - Query options
   * @returns {Promise} - Resolves with list of data
   */
  listAppointment(data) {
    const queryOptions = {
      where: {
        calendarSid: data.calendarSid
      }
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .listData('appointment', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get appointment service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getAppointment(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('appointment', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update appointment service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateAppointment(data) {
    const queryOptions = {
      where: {
        seatSid: {
          [Op.in]: data.updateList
        }
      }
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('appointment', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete appointment service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteAppointment(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('appointment', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  }
};

module.exports = appointmentService;
