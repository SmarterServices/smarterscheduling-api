'use strict';

const appointmentService = require('./../services/appointment');

const appointmentHandler = {

  /**
   * Add appointment handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addAppointment: function addAppointment(data, callback) {

    //Call the service to get the data from DB
    appointmentService
      .addAppointment(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List appointment handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listAppointment: function listAppointment(data, callback) {

    //Call the service to get the data from DB
    appointmentService
      .listAppointment(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get appointment handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getAppointment: function getAppointment(data, callback) {

    //Call the service to get the data from DB
    appointmentService
      .getAppointment(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update appointment handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateAppointment: function updateAppointment(data, callback) {

    //Call the service to get the data from DB
    appointmentService
      .updateAppointment(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete appointment handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteAppointment: function deleteAppointment(data, callback) {

    //Call the service to get the data from DB
    appointmentService
      .deleteAppointment(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = appointmentHandler;
