'use strict';

const calenderSeatService = require('./../services/calender-seat');

const calenderSeatHandler = {

  /**
   * Add calenderSeat handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addCalenderSeat: function addCalenderSeat(data, callback) {

    //Call the service to get the data from DB
    calenderSeatService
      .addCalenderSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List calenderSeat handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listCalenderSeat: function listCalenderSeat(data, callback) {

    //Call the service to get the data from DB
    calenderSeatService
      .listCalenderSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get calenderSeat handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getCalenderSeat: function getCalenderSeat(data, callback) {

    //Call the service to get the data from DB
    calenderSeatService
      .getCalenderSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update calenderSeat handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateCalenderSeat: function updateCalenderSeat(data, callback) {

    //Call the service to get the data from DB
    calenderSeatService
      .updateCalenderSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete calenderSeat handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteCalenderSeat: function deleteCalenderSeat(data, callback) {

    //Call the service to get the data from DB
    calenderSeatService
      .deleteCalenderSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = calenderSeatHandler;
