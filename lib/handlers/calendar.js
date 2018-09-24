'use strict';

const calendarSeatService = require('./../services/calendar-seat');
const calendarService = require('./../services/calendar');
const scheduleService = require('./../services/schedule');
const sequelize = require('../middleware/db-connection').getConnection();
const utils = require('./../helpers/utils');

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
    let numberOfSeats;

    calendarService
      .validatePayload(data)
      .then(() => {
        return sequelize
          .transaction(() => {
            return calendarService
              .addCalendar(data)
              .then((calendarData) => {
                addedCalendar = calendarData;
                return calendarService.addSeatsForCalendar(calendarData.sid, data);
              })
              .then((seats) => {
                numberOfSeats = seats.results.length;
                data.payload.calendarSid = addedCalendar.sid;
                return scheduleService.addSchedule(data);
              });
          });
      })
      .then(function onSuccess(scheduleData) {
        addedCalendar.schedule = scheduleData;
        addedCalendar.numberOfSeats = numberOfSeats;
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
   * @param {Object} data.params.locationSid - Location sid in params
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listCalendar: function listCalendar(data, callback) {

    const listOptions = Object.assign({}, data.query, {
      locationSid: data.params.locationSid
    });

    //Call the service to get the data from DB
    calendarService
      .listCalendar(listOptions)
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
   * @param {Object} data.paramValidationResult- DB object for params
   * @param {Object} data.paramValidationResult.calendar- Calendar object from database
   * @param {Function} callback - Callback for handling response
   */
  getCalendar: function getCalendar(data, callback) {
    const calendar = data.paramValidationResult.calendar;

    //Call the service to get the data from DB
    calendarService
      .getCalendarDetails(calendar)
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
  updateCalendar(data, callback) {
    const calendarData = data.paramValidationResult.calendar;
    const calendarSid = data.params.calendarSid;
    data.calendarSid = calendarSid;

    calendarService
      .validatePayload(data)
      .then(() => {
        return sequelize.transaction(() => {
          const promises = [
            calendarService.updateCalendar(data),
            calendarSeatService.listcalendarSeat(data),
            scheduleService.updateSchedule(data)
          ];

          return utils
            .wrapValidation(promises)
            .then((returnedData) => {
              data.calendarSeats = returnedData[1].results;
              return calendarService.syncNumberOfSeats(data);
            });
        });
      })
      .then(() => {
        return calendarService.getCalendarDetails(calendarData);
      })
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
