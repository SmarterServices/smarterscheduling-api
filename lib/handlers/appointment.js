'use strict';

const appointmentService = require('./../services/appointment');
const calendarService = require('./../services/calendar');
const utils = require('./../helpers/utils');

const appointmentHandler = {

  /**
   * Add appointment handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addAppointment: function addAppointment(data, callback) {
    const accountSid = data.params.accountSid;
    const calendarSid = data.payload.calendarSid;
    const payload = Object.assign({}, data.payload, {accountSid});

    calendarService
      .validateCalendarWithAccount(calendarSid, accountSid)
      .then(() => {
        return appointmentService.addAppointment(payload);
      })
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
    const propertiesToPick = [
      'params.accountSid',
      'query.startDate',
      'query.endDate',
      'query.calendarSid',
      'query.locationSid'
    ];

    const options = utils.pickProperties(data, propertiesToPick);
    appointmentService
      .listDateWiseAppointment(options)
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
   * @param {Array<Object>} data.paramValidationResult - Param Validation Result
   * @param {Object} data.paramValidationResult[0].accpimt- Account Object from database
   * @param {Object} data.paramValidationResult[1].appointment - Appointment Object from database
   * @param {Function} callback - Callback for handling response
   */
  getAppointment: function getAppointment(data, callback) {
    const propertiesToPick = [
      'params.accountSid',
      'paramValidationResult.0.account',
      'paramValidationResult.1.appointment',
      'paramValidationResult.1.appointment.calendarSid'
    ];

    const options = utils.pickProperties(data, propertiesToPick);

    calendarService
      .validateCalendarWithAccount(options.calendarSid, options.accountSid)
      .then(function onSuccess(data) {
        callback(null, options.appointment);
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
  },

  /**
   * Update appointment handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  patchAppointment: function patchAppointment(data, callback) {
    const propertiesToPick = [
      'params.accountSid',
      'paramValidationResult.0.account',
      'paramValidationResult.1.appointment',
      'paramValidationResult.1.appointment.calendarSid',
      'payload'
    ];

    const options = utils.pickProperties(data, propertiesToPick);

    calendarService
      .validateCalendarWithAccount(options.calendarSid, options.accountSid)
      .then(() => {
        return appointmentService.patchAppointment(options);
      })
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }

};

module.exports = appointmentHandler;
