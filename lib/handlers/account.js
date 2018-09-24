'use strict';

const accountService = require('./../services/account');
const calendarService = require('./../services/calendar');

const accountHandler = {

  /**
   * Add account handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addAccount: function addAccount(data, callback) {

    //Call the service to get the data from DB
    accountService
      .addAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List account handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listAccount: function listAccount(data, callback) {
    const opts = Object.assign({}, data.query);

    //Call the service to get the data from DB
    accountService
      .listAccount(opts)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get account handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getAccount: function getAccount(data, callback) {

    //Call the service to get the data from DB
    accountService
      .getAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update account handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateAccount: function updateAccount(data, callback) {

    //Call the service to get the data from DB
    accountService
      .updateAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete account handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteAccount: function deleteAccount(data, callback) {

    //Call the service to get the data from DB
    accountService
      .deleteAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Lists Availibility for scheduling
   * @param {Object} data - The data to use for listing available appointments
   * @param {Object} data.paramValidationResult - Data from param validation plugin
   * @param {Object} data.paramValidationResult.account - Account data
   * @param {Object} data.paramValidationResult.account.sid - Account sid
   * @param {Object} data.query - Query sent with the request
   * @param {Object} data.query.calendarSid - Sid of required calendar
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  listAppointmentAvailability(data, callback) {
    const calendarSid = data.query.calendarSid;
    const accountSid = data.paramValidationResult.account.sid;

    accountService
      .validateQuery(data.query)
      .then(() => {
        return calendarService
          .validateCalendarWithAccount(calendarSid, accountSid);
      })
      .then(() => {
        return accountService
          .listAppointmentAvailability(data);
      })
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = accountHandler;
