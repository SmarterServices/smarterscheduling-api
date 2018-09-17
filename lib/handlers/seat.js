'use strict';

const seatService = require('./../services/seat');

const seatHandler = {

  /**
   * Add seat handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addSeat: function addSeat(data, callback) {

    //Call the service to get the data from DB
    seatService
      .addSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List seat handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listSeat: function listSeat(data, callback) {

    //Call the service to get the data from DB
    seatService
      .listSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get seat handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getSeat: function getSeat(data, callback) {

    //Call the service to get the data from DB
    seatService
      .getSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update seat handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateSeat: function updateSeat(data, callback) {

    //Call the service to get the data from DB
    seatService
      .updateSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete seat handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteSeat: function deleteSeat(data, callback) {

    //Call the service to get the data from DB
    seatService
      .deleteSeat(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = seatHandler;
