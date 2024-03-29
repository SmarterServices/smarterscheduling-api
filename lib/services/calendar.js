'use strict';
const _ = require('lodash');
const herokuData = require('./../middleware/db-connection');
const object2Dot = require('object2dot');
const appointmentService = require('./../services/appointment');
const calendarSeatService = require('./../services/calendar-seat');
const locationService = require('./../services/location');
const scheduleService = require('./../services/schedule');
const seatService = require('./../services/seat');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const utils = require('./../helpers/utils');

const calendarService = {

  /**
   * Add calendar service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {string} data.locationSid - Location sid
   * @returns {Promise} - Resolves with added data
   */
  addCalendar(data) {

    data.payload.schedulingLocationSid = data.locationSid;

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

    const paginationString = utils.buildPaginationString(
      {
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
    const queryOptions = [['sid', 'calendarSid']];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('calendar', data, query)
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
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateCalendar(data) {
    utils.validateArguments(arguments, [{payload: 'object.required', sid: 'string', calendarSid: 'string'}]);

    const queryOptions = [['sid', 'calendarSid']];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('calendar', data, query)
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
    try {
      utils.validateArguments(arguments, [{
        paramValidationResult: 'object.required',
        payload: 'object.required'
      }]);
    } catch (error) {
      console.error(error.stack || error);
      return Promise.reject(error);
    }

    const locationData = data.paramValidationResult.location;
    // If seat management of location is basic then numberOfSeats is must required
    const payloadValidationPromise = (locationData.seatManagement === 'basic' && !data.payload.numberOfSeats)
      ? Promise.reject(errorResponse.formatError('NUMBER_OF_SEATS_REQUIRED'))
      : Promise.resolve();

    return payloadValidationPromise;
  },

  /**
   * Add seats with calendar seat
   * @param {Object} data - Required data for adding seat with calendar seat
   * @param {string} data.calendarSid - calendar sid under which seats are added
   * @param {string} data.locationSid - LocationSid of calendar
   * @param {string} data.payload - calendar sid under which seats are added
   * @returns {Promise} - Adds seats along with calendar seat
   */
  addSeatsForCalendar(data) {
    utils.validateArguments(arguments, [{
      calendarSid: 'sid.required',
      locationSid: 'sid.required',
      payload: 'object.required'
    }]);

    const bulkCreatePayloadForCalendarSeat = [];
    // Number of seats to be added
    const numberOfSeats = data.payload.numberOfSeats || 0;

    return seatService
      .addMultipleSeat(numberOfSeats, data.locationSid)
      .then((addedSeats) => {
        //Number of calendar seats is added equal to number of added seats
        for (const seats of addedSeats.results) {
          const calendarSeatPayload = {
            calendarSid: data.calendarSid,
            seatSid: seats.sid
          };
          bulkCreatePayloadForCalendarSeat.push(calendarSeatPayload);
        }
        return calendarSeatService.addMultipleCalendarSeats(bulkCreatePayloadForCalendarSeat);
      });
  },

  /**
   * Remove seats with calendar seat
   * @param {string} calendarSid - calendar sid under which seats are added
   * @param {Object} data - Required data for removing seat with calendar seat
   * @param {array} data.calendarSeats - Previously existing seats
   * @param {Object} data.payload - Payload from request
   * @returns {Promise} - Remove seats along with calendar seat
   */
  removeSeatsForCalendar(calendarSid, data) {
    utils.validateArguments(arguments, ['sid.required', {calendarSeats: 'array.required', payload: 'object.required'}]);

    const numberOfSeatsToRemove = data.payload.numberOfSeats;
    let deletionList = data.calendarSeats.map(calendarSeat => calendarSeat.seatSid);

    return appointmentService
      .listAppointment(data)
      .then((appointmentData) => {

        let appointmentSeatSids = appointmentData.results.map(appointment => appointment.seatSid);
        deletionList = deletionList.filter((item) => {
          return !appointmentSeatSids.includes(item);
        });

        const promises = [];

        if (deletionList.length >= numberOfSeatsToRemove) {
          deletionList = deletionList.slice(0, numberOfSeatsToRemove);
          data.deletionList = deletionList;

          promises.push(seatService.deleteSeat(data));
          promises.push(calendarSeatService.deletecalendarSeat(data));
        } else {
          appointmentSeatSids = appointmentSeatSids.slice(0, numberOfSeatsToRemove - deletionList.length);
          deletionList = deletionList.concat(appointmentSeatSids);
          const appointmentUpdateOptions = {
            seatSids: appointmentSeatSids,
            payload: {
              seatSid: null
            }
          };
          data.deletionList = deletionList;

          promises.push(seatService.deleteSeat(data));
          promises.push(calendarSeatService.deletecalendarSeat(data));
          promises.push(appointmentService.updateAppointment(appointmentUpdateOptions));
        }

        return utils.wrapValidation(promises);
      });
  },

  /**
   * Returns a calendar with schedule and numberOfSeats for a calendar
   * @param {Object} calendar - Calendar object from database
   * @returns {Promise} - A calendar with schedule and numberOfSeats
   */
  getCalendarDetails(calendar) {
    utils.validateArguments(arguments, [{sid: 'sid.required'}]);

    const calendarSid = calendar.sid;
    const fetchDataPromise = [
      this.getCalendar({calendarSid}),
      scheduleService.getSchedule({calendarSid}),
      calendarSeatService.listCalendarSeat({calendarSid})
    ];
    return utils
      .wrapValidation(fetchDataPromise)
      .then((response) => {
        const result = Object.assign(
          {},
          response[0],
          {
            schedule: response[1],
            numberOfSeats: response[2].results.length
          }
        );

        return Promise.resolve(result);
      });
  },

  /**
   * Syncs the number of seats of payload with present data
   * @param {Object} syncOptions - Options for synchronization
   * @param {Object} syncOptions.calendarSid - Sid of calendar
   * @param {Object} syncOptions.calendarSeats - Current seats
   * @param {Object} syncOptions.payload - Payload form request
   * @returns {Promise} - Resolves with synced data
   */
  syncNumberOfSeats(syncOptions) {
    utils.validateArguments(arguments, [{
      calendarSid: 'sid.required',
      calendarSeats: 'array.required',
      payload: 'object.required'
    }]);

    const _this = this;
    if (!syncOptions.payload.numberOfSeats) {
      return Promise.resolve();
    }
    const currentNumberOfSeats = syncOptions.calendarSeats.length;
    const requiredNumberOfSeats = syncOptions.payload.numberOfSeats;
    syncOptions.payload.numberOfSeats = Math.abs(requiredNumberOfSeats - currentNumberOfSeats);


    if (currentNumberOfSeats === requiredNumberOfSeats) {
      //We don't need to change anything if number of seats is unchanged
      return Promise.resolve();
    } else if (currentNumberOfSeats < requiredNumberOfSeats) {
      //Add seats if there is a shortage
      return _this.addSeatsForCalendar(syncOptions);
    } else {
      //Remove seats if there are more seats than required
      return _this.removeSeatsForCalendar(syncOptions.calendarSid, syncOptions);
    }

  },

  /**
   * Validates Calendar with Account
   * @param {string} [calendarSid] - Calendar Sid must be provided if calendarData is not present
   * @param {string} schedulingAccountSid - Account Sid
   * @param {Object} [calendarData] - Optionally sent previously acquired calendar data
   * @returns {Promise<T | never>} - Validation promise
   */
  validateCalendarWithAccount(calendarSid, schedulingAccountSid, calendarData) {
    try {
      utils.validateArguments(arguments, ['sid', 'sid.required', 'object']);
    } catch (error) {
      return Promise.reject(error);
    }

    const getCalendarPromise = calendarData
      ? Promise.resolve(calendarData)
      : this.getCalendar({sid: calendarSid});

    return getCalendarPromise
      .then((calendarData) => {
        const locationSid = calendarData.schedulingLocationSid;
        return locationService.getLocation({locationSid, schedulingAccountSid});
      })
      .catch((error) => {
        const isNotFoundError = error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code
          || error.code === errorResponse.ERROR_LIST.LOCATION_NOT_FOUND.code;

        if (isNotFoundError) {
          calendarSid = calendarSid || calendarData.sid;

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
