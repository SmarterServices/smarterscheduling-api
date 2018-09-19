'use strict';

const calendarSeatService = require('./../services/calendar-seat');

const calendarSeatHandler = {

  /**
   * Add calendarSeat handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addcalendarSeat: function addcalendarSeat(data, callback) {

    //Call the service to get the data from DB
    calendarSeatService
      .addcalendarSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List calendarSeat handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listcalendarSeat: function listcalendarSeat(data, callback) {

    //Call the service to get the data from DB
    calendarSeatService
      .listcalendarSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get calendarSeat handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getcalendarSeat: function getcalendarSeat(data, callback) {

    //Call the service to get the data from DB
    calendarSeatService
      .getcalendarSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update calendarSeat handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updatecalendarSeat: function updatecalendarSeat(data, callback) {

    //Call the service to get the data from DB
    calendarSeatService
      .updatecalendarSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete calendarSeat handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deletecalendarSeat: function deletecalendarSeat(data, callback) {

    //Call the service to get the data from DB
    calendarSeatService
      .deletecalendarSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = calendarSeatHandler;
