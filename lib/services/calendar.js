'use strict';
const _ = require('lodash');
const herokuData = require('./../middleware/db-connection');
const object2Dot = require('object2dot');
const calendarSeatService = require('./../services/calendar-seat');
const locationService = require('./../services/location');
const scheduleService = require('./../services/schedule');
const seatService = require('./../services/seat');
const Sequelize = require('sequelize');
const utils = require('./../helpers/utils');

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
   * @param {Object} data.locationSid - Location sid
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listCalendar(data) {

    const queryReplacements = {
      locationSid: data.locationSid,
      limit: data.limit,
      offset: data.offset
    };
    const queryOptions = {
      type: Sequelize.QueryTypes.SELECT,
      replacements: queryReplacements
    };

    const paginationString = utils.buildPaginationString({
        limit: data.limit,
        offset: data.offset,
        sortKeys: data.sortKeys,
        sortOrder: data.sortOrder
      },
      {createdDate: 'CL.createddate'}
    );

    const query = `
    SELECT
      CL.sid__c  AS "sid",
      CL.scheduling_location__r__sid__c  AS "schedulingLocationSid",
      CL.title__c  AS "title",
      SC.sid__c  AS "schedule.sid",
      SC.interval__c  AS "schedule.interval",
      SC.end_buffer__c  AS "schedule.endBuffer",
      CL.createddate  AS "createdDate",
      CL.lastmodifieddate  AS "lastModifiedDate",
      (
          SELECT
              CAST(count( distinct(CS.seat__r__sid__c) ) as INTEGER)
          FROM
              ${utils.tableWithSchema('sc_calendar_seat__c')} CS
          where
              CL.sid__c = CS.calendar__r__sid__c
       ) AS "numberOfSeats"
      FROM
          ${utils.tableWithSchema('sc_calendar__c')}  AS CL 
      JOIN ${utils.tableWithSchema('sc_schedule__c')}  AS SC
        ON SC.calendar__r__sid__c = CL.sid__c
      WHERE
        CL.scheduling_location__r__sid__c = :locationSid
        ${paginationString}
    `;

    const countQuery = `
    SELECT COUNT(1)
      FROM
          ${utils.tableWithSchema('sc_calendar__c')}  AS CL
      JOIN ${utils.tableWithSchema('sc_schedule__c')}  AS SC
        ON SC.calendar__r__sid__c = CL.sid__c
      WHERE
          CL.scheduling_location__r__sid__c = :locationSid
    `;

    const dbRequests = [
      herokuData.runQuery(query, queryOptions),
      herokuData.runQuery(countQuery, queryOptions)
    ];

    //call common DB method with model name to retrieve data
    return utils
      .wrapValidation(dbRequests)
      .then(function onSuccess(data) {
        const calenderList = data[0];

        const response = {
          results: calenderList.map(object2Dot.rebuild),
          total: parseInt(_.get(data, '[1][0].count', 0))
        };

        return Promise.resolve(response);
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
  addSeatsForCalendar(calendarSid, data) {
    const bulkCreatePayloadForcalendarSeat = [];
    // Number of seats to be added
    const numberOfSeats = data.payload.numberOfSeats || 0;

    return seatService
      .addMultipleSeat(numberOfSeats, data.params.locationSid)
      .then((addedSeats) => {
        //Number of calendar seats is added equal to number of added seats
        for (const seats of addedSeats.results) {
          const calendarSeatPayload = {
            calendarSid,
            seatSid: seats.sid
          };
          bulkCreatePayloadForcalendarSeat.push(calendarSeatPayload);
        }
        return calendarSeatService.addMultipleCalendarSeats(bulkCreatePayloadForcalendarSeat);
      });
  },

  /**
   * Returns a calendar with schedule and numberOfSeats for a calendar
   * @param {Object} calendar - Calendar object from database
   * @returns {Promise} - A calendar with schedule and numberOfSeats
   */
  getCalendarDetails(calendar) {
    const calendarSid = calendar.sid;
    const fetchDataPromise = [
      scheduleService.getSchedule({calendarSid}),
      calendarSeatService.listcalendarSeat({calendarSid})
    ];
    return utils
      .wrapValidation(fetchDataPromise)
      .then((response) => {
        Object.assign(calendar, {
          schedule: response[0],
          numberOfSeats: response[1].results.length
        });
        return Promise.resolve(calendar);
      });
  },

  /**
   * Validates Calendar with Account
   * @param {string} calendarSid - Calendar Sid
   * @param {string} schedulingAccountSid - Account Sid
   * @returns {Promise<T | never>} - Validation promise
   */
  validateCalendarWithAccount(calendarSid, schedulingAccountSid) {
    return this
      .getCalendar({sid: calendarSid})
      .then((calendarData) => {
        const locationSid = calendarData.schedulingLocationSid;
        return locationService.getLocation({locationSid, schedulingAccountSid});
      })
      .catch((error) => {
        const isNotFoundError = error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code
          || error.code === errorResponse.ERROR_LIST.LOCATION_NOT_FOUND.code;

        if (isNotFoundError) {
          const errorOptions = {
            values: {schedulingAccountSid, calendarSid}
          };

          error = errorResponse.formatError('CALENDAR_NOT_FOUND_UNDER_ACCOUNT', errorOptions);

        } else {
          console.error(error.stack || error);
        }

        return Promise.reject(error);
      });
  }
};

module.exports = calendarService;
