'use strict';

const availabilityService = require('./../services/availability');
const scheduleService = require('./../services/schedule');
const utils = require('./../helpers/utils');

const availabilityHandler = {

  /**
   * Modify availability handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  batchModifyAvailability: function addAvailability(data, callback) {
    const accountSid = data.params.accountSid;
    const scheduleSid = data.params.scheduleSid;
    const availabilityOpts = {
      accountSid,
      scheduleSid,
      payload: data.payload
    };

    scheduleService
      .validateScheduleAndAccount(accountSid, scheduleSid)
      .then(() => {
        return availabilityService.batchModifyAvailability(availabilityOpts);
      })
      .then(() => {
        return availabilityService.listAvailability({scheduleSid, sortOrder: 'createdDate'});
      })
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List availability handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listAvailability: function listAvailability(data, callback) {
    const accountSid = data.params.accountSid;
    const scheduleSid = data.params.scheduleSid;
    const availabilityOpts = Object.assign({}, data.query, {
      accountSid,
      scheduleSid
    });

    //Call the service to get the data from DB

    scheduleService
      .validateScheduleAndAccount(accountSid, scheduleSid)
      .then(availabilityService.listAvailability.bind(availabilityService, availabilityOpts))
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get availability handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getAvailability: function getAvailability(data, callback) {

    //Call the service to get the data from DB
    availabilityService
      .getAvailability(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update availability handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateAvailability: function updateAvailability(data, callback) {

    //Call the service to get the data from DB
    availabilityService
      .updateAvailability(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete availability handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteAvailability: function deleteAvailability(data, callback) {

    //Call the service to get the data from DB
    availabilityService
      .deleteAvailability(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List calendar availability handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {Function} callback - Callback for handling response
   */
  listCalendarAvailability(data, callback) {
    const propertiesToPick = [
      'params.accountSid',
      'params.calendarSid',
      'query.startDate',
      'query.endDate',
      'paramValidationResult.0.account',
      'paramValidationResult.1.calendar'
    ];

    const options = utils.pickProperties(data, propertiesToPick);

    availabilityService
      .listCalendarAvailability(options)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

};

module.exports = availabilityHandler;
