'use strict';

const calendarService = require('./../services/calendar');
const scheduleService = require('./../services/schedule');

const calendarHandler = {

  /**
   * Add calendar handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Object} data.payload.numberOfSeats - The payload to add
   * @param {Object} data.paramValidationResult - Data from param validation plugin
   * @param {Object} data.paramValidationResult.location - Location data
   * @param {Function} callback - Callback for handling response
   */
  addCalendar(data, callback) {

    let addedCalendar;

    calendarService
      .validatePayload(data)
      .then(() => {
        return calendarService.addCalendar(data);
      })
      .then((calendarData) => {
        addedCalendar = calendarData;
        return calendarService.addSeatsForcalendar(calendarData.sid, data);
      })
      .then(() => {
        data.payload.calendarSid = addedCalendar.sid;
        return scheduleService.addSchedule(data);
      })
      .then(function onSuccess(scheduleData) {
        addedCalendar.schedule = scheduleData;
        addedCalendar.numberOfSeats = data.payload.numberOfSeats;
        callback(null, addedCalendar);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List calendar handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listCalendar: function listCalendar(data, callback) {

    //Call the service to get the data from DB
    calendarService
      .listCalendar(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get calendar handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getCalendar: function getCalendar(data, callback) {

    //Call the service to get the data from DB
    calendarService
      .getCalendar(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update calendar handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateCalendar: function updateCalendar(data, callback) {

    //Call the service to get the data from DB
    calendarService
      .updateCalendar(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete calendar handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteCalendar: function deleteCalendar(data, callback) {

    //Call the service to get the data from DB
    calendarService
      .deleteCalendar(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  }
};

module.exports = calendarHandler;
