'use strict';
const herokuData = require('./../middleware/db-connection');
const utils = require('./../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const calendarSeatService = {

  /**
   * Add calendarSeat service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addcalendarSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('calendar-seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List calendarSeat service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listCalendarSeat(data) {
    const queryOptions = ['calendarSid'];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('calendar-seat', data, query)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get calendarSeat service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getcalendarSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('calendar-seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update calendarSeat service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updatecalendarSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('calendar-seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete calendarSeat service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deletecalendarSeat(data) {
    const queryOptions = {
      where: {
        seatSid: {
          [Op.in]: data.deletionList
        }
      }
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('calendar-seat', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Add multiple calendar-seats
   * @param {Array} data - Payload required for bulk create
   * @returns {Promise} - Resolves with number of row that has been inserted
   */
  addMultipleCalendarSeats(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .bulkCreate('calendar-seat', {payload: data}, null)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  }
};

module.exports = calendarSeatService;
