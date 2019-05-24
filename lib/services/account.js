'use strict';
const herokuData = require('../middleware/db-connection');
const Sequelize = require('sequelize');
const utils = require('./../helpers/utils');

const accountService = {

  /**
   * Add account service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addAccount(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('account', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List account service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listAccount(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('account', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get account service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getAccount(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('account', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update account service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateAccount(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('account', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete account service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteAccount(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('account', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List Appointment Availability service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.query - The query sent with the request
   * @param {Object} data.query.calendarSid - Sid of required calendar
   * @param {Object} data.query.startDateTime - Start Date time of the appointment
   * @param {Object} data.query.endDateTime - End date time of the appointment
   * @param {Object} data.query.duration - Duration of the appointment
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with the list of appointment availability
   */
  listAppointmentAvailability(data) {
    const queryReplacements = {
      calendarSid: data.query.calendarSid,
      startDateTime: data.query.startDateTime,
      endDateTime: data.query.endDateTime,
      duration: data.query.duration
    };

    const queryOptions = {
      type: Sequelize.QueryTypes.SELECT,
      replacements: queryReplacements
    };

    const query = `
    SELECT
        AA."startDateTime",
        AA."endDateTime",
        AA."seatCount",
        AA."duration"
    FROM
        ${utils.procedureWithSchema('fn_get_appointment_availability_final')}(
            :calendarSid,
            :startDateTime::timestamp without time zone,
            :endDateTime::timestamp without time zone,
            :duration
        ) AA
    ORDER BY
    "startDateTime"
    `;

    //call common DB method with model name to retrieve data
    return herokuData
      .runQuery(query, queryOptions)
      .then(function onSuccess(data) {
        const response = {
          results: data
        };
        return Promise.resolve(response);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Validates the query sent with the request
   * @param {Object} query - Query sent with the request
   * @returns {Promise} - Rejects if end date time is not after start date time
   */
  validateQuery(query) {
    const startDateTime = query.startDateTime;
    const endDateTime = query.endDateTime;

    const errorOptions = {
      values: {startDateTime, endDateTime}
    };

    const validationPromise = utils.isDateAfter(startDateTime, endDateTime)
      ? Promise.reject(errorResponse.formatError('END_DATE_TIME_SHOULD_BE_AFTER_START_DATE_TIME', errorOptions))
      : Promise.resolve();

    return validationPromise;
  }
};

module.exports = accountService;
