'use strict';
const herokuData = require('./../middleware/db-connection');
const seatService = require('./../services/seat');
const faker = require('faker');
const calendarSeatService = require('./../services/calendar-seat');

const calendarService = {

  /**
   * Add calendar service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addCalendar(data) {

    data.payload.schedulingLocationSid = data.params.locationSid;

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('calendar', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List calendar service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listCalendar(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('calendar', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get calendar service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getCalendar(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('calendar', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update calendar service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateCalendar(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('calendar', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete calendar service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteCalendar(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('calendar', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Payload validation before adding calendar
   * @param {Object} data - Data for payload validation
   * @returns {Promise} - Rejects error for no numberOfSeats if basic seat management
   */
  validatePayload(data) {
    const locationData = data.paramValidationResult.location;
    // If seat management of location is basic then numberOfSeats is must required
    const payloadValidationPromise = (locationData.seatManagement === 'basic' && !data.payload.numberOfSeats)
      ? Promise.reject(errorResponse.formatError('NUMBER_OF_SEATS_REQUIRED'))
      : Promise.resolve();

    return payloadValidationPromise;
  },

  /**
   * Add seats with calendar seat
   * @param {string} calendarSid - calendar sid under which seats are added
   * @param {number} data - Required data for adding seat with calendar seat
   * @returns {Promise} - Adds seats along with calendar seat
   */
  addSeatsForcalendar(calendarSid, data) {
    const bulkCreatePayloadForSeats = [];
    const bulkCreatePayloadForcalendarSeat = [];
    // Number of seats to be added
    const numberOfSeats = data.payload.numberOfSeats || 0;
    const seatPayload = {
      payload: {
        schedulingLocationSid: data.params.locationSid
      }
    };

    // Creating the payloads for adding multiple seats
    for(let i = 0; i < numberOfSeats; i++) {
      seatPayload.payload.title = faker.commerce.color() + faker.random.number().toString();
      bulkCreatePayloadForSeats.push(seatPayload);
    }

    return seatService
      .addMultipleSeat(bulkCreatePayloadForSeats)
      .then((addedSeats) => {
        const calendarSeatPayload = {
          payload: {
            calendarSid
          }
        };
        //Number of calendar seats is added equal to number of added seats
        for(const seats of addedSeats.results) {
          calendarSeatPayload.payload.seatSid = seats.sid;
          bulkCreatePayloadForcalendarSeat.push(calendarSeatPayload);
        }
        return calendarSeatService.addMultiplecalendarSeats(bulkCreatePayloadForcalendarSeat);
      });
  }
};

module.exports = calendarService;
