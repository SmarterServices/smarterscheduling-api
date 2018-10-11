'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const moment = require('moment');
const Op = Sequelize.Op;
const object2Dot = require('object2dot');

const herokuData = require('./../middleware/db-connection');
const utils = require('./../helpers/utils');

const appointmentService = {

  /**
   * Add appointment service
   * @param {Object} data - The data to use for add
   * @param {string} data.calendarSid - CalendarSid
   * @param {string} [data.seatSid] - Seat Sid
   * @param {string} [data.email] - Email
   * @param {string} data.startDateTime - Start Time of the exam
   * @param {number} data.duration - Duration of the exam
   * @param {string} data.externalId - External ID
   * @param {string} data.externalSystem - External ID
   * @param {string} data.firstName - The first name of the person making the reservation
   * @param {string} data.lastName - The last name of the person making the reservation
   * @param {string} data.phone - Phone
   * @param {string} data.notes - Notes
   * @param {string} data.metadata - Metadata
   * @returns {Promise} - Resolves with added data
   */
  addAppointment(data) {
    const _this = this;
    const validationSchema = [{
      calendarSid: 'sid.required',
      seatSid: 'sid',
      startDateTime: 'date.required',
      duration: 'number.required',
      firstName: 'string.required',
      lastName: 'string.required',
      email: 'string.required'
    }];
    utils.validateArguments(arguments, validationSchema);


    const sid = utils.getNewId('appointment')();
    const queryReplacements = Object.assign({}, data, {
      sid,
      status: 'scheduled'
    });

    const queryOptions = {
      type: Sequelize.QueryTypes.INSERT,
      replacements: queryReplacements
    };

    const filterBySeatSid = data.seatSid
      ? 'and "seatSid" = :seatSid'
      : '';


    const query = `
    INSERT
      INTO ${utils.tableWithSchema('sc_appointment__c')}
    (
      calendar__r__sid__c,
      createddate,
      email__c,
      end_date__c,
      external_id__c,
      external_system__c,
      first_name__c,
      isdeleted,
      last_name__c,
      lastmodifieddate,
      metadata__c,
      notes__c,
      phone__c,
      seat__r__sid__c,
      sid__c,
      start_date__c,
      status__c,
      systemmodstamp
     )
    SELECT
      :calendarSid,
      now() at time zone 'utc',
      :email,
      (:startDateTime)::timestamp + ( :duration || ' minutes')::interval,
      :externalId,
      :externalSystem,
      :firstName,      
      false,
      :lastName,
      now() at time zone 'utc',
      :metadata,
      :notes,
      :phone,
      "SE"."seatSid",
      :sid,
      :startDateTime,
      :status,
      now() at time zone 'utc'
    FROM
      ${utils.tableWithSchema('fn_get_appointment_availability_with_seat_detail')}(
      :calendarSid,
      :startDateTime,
      (:startDateTime)::timestamp + ('12 hours')::interval,
      :duration
      ) AS "SE"
    WHERE
    "startDateTime" = :startDateTime
    ${filterBySeatSid}
    LIMIT 1
    returning *
    ;`;

    return herokuData
      .runQuery(query, queryOptions)
      .then((response) => {
        const result = response[0];

        if (!result.length) {
          return Promise.reject(errorResponse.formatError('APPOINTMENT_CREATION_FAILED'));
        }

        //will be added only one appointment due to limit
        const appointment = _this.mapAddedResponse(result[0]);
        return Promise.resolve(appointment);
      });

  },

  /**
   * Maps Response according to template
   * @param {Object} data - Added Appointment Data
   * @returns {Object} - Mapped Response
   */
  mapAddedResponse(data) {
    const keyMap = {
      sid__c: 'sid',
      seat__r__sid__c: 'seatSid',
      calendar__r__sid__c: 'calendarSid',
      start_date__c: 'startDate',
      end_date__c: 'endDate',
      first_name__c: 'firstName',
      last_name__c: 'lastName',
      email__c: 'email',
      phone__c: 'phone',
      external_id__c: 'externalId',
      external_system__c: 'externalSystem',
      notes__c: 'notes',
      internal_notes__c: 'internalNotes',
      metadata__c: 'metadata'
    };


    const response = _.mapKeys(data, function (value, key) {
      return keyMap[key];
    });
    return response;
  },

  /**
   * List appointment service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Object} queryOptions - Query options
   * @returns {Promise} - Resolves with list of data
   */
  listAppointment(data) {
    utils.validateArguments(arguments, [{calendarSid: 'sid.required'}]);

    const queryOptions = {
      where: {
        calendarSid: data.calendarSid
      }
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .listData('appointment', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get appointment service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getAppointment(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('appointment', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update appointment service
   * @param {Object} data - The data to use for update
   * @param {Object} data.payload - The payload to update
   * @param {Object} [data.seatSids] - Filter update by seatSid
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateAppointment(data) {
    utils.validateArguments(arguments, [{seatSids: 'array'}]);

    const queryOptions = {
      where: {}
    };

    if (data.seatSids) {
      queryOptions.where.seatSid = {
        [Op.in]: data.seatSids
      };
    }

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('appointment', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete appointment service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteAppointment(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('appointment', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Patches Appointment
   * @param {Object} data - Data For Patch
   * @param {Object} data.appointment - Appointment Object from database,
   * @param {Object} data.payload - Payload to update with
   * @param {string} [data.payload.externalId] - External Id
   * @param {string} [data.payload.externalSystem] - External System
   * @param {string} [data.payload.externalSystem] - External System
   * @param {string} [data.payload.firstName] - First Name
   * @param {string} [data.payload.lastName] - Last Name
   * @param {string} [data.payload.email] - Email
   * @param {string} [data.payload.phone] - Phone
   * @param {string} [data.payload.notes] - Notes
   * @param {string} [data.payload.metadata] - Metadata
   * @param {string} [data.payload.internalNotes] - Internal Notes
   * @param {string} [data.payload.status] - Status
   * @param {string} [data.payload.statusMemo] - Status Memo
   * @returns {Promise<Object>} - Updated Data
   */
  patchAppointment(data) {
    const _this = this;
    const validationSchema = [{
      appointment: {
        sid: 'sid.required'
      },
      payload: 'object.required'
    }];
    utils.validateArguments(arguments, validationSchema);

    const {payload, appointment} = data;

    //merge the payload
    const replacements = Object.assign({}, appointment, payload);

    const queryOptions = {
      replacements,
      type: Sequelize.QueryTypes.UPDATE
    };

    const {startDateTime} = payload;
    const {updateTimeAndSeatQuery, fromQuery, timeFilter} = _this.getTimeRelatedQuery(startDateTime);

    const query = `
            UPDATE
              ${utils.tableWithSchema('sc_appointment__c')} SP
            SET
              ${updateTimeAndSeatQuery}
              external_id__c = :externalId,
              external_system__c = :externalSystem,
              first_name__c = :firstName,
              last_name__c = :lastName,
              email__c = :email,
              phone__c = :phone,
              notes__c = :notes,
              metadata__c = :metadata,
              internal_notes__c = :internalNotes,
              status__c = :status,
              status_memo__c = :statusMemo              
            ${fromQuery}
            WHERE
              SP.sid__c = :sid
              ${timeFilter}
            RETURNING *;
             `;

    return herokuData
      .runQuery(query, queryOptions)
      .then((response) => {
        const result = response[0];

        if (!result.length) {
          return Promise.reject(errorResponse.formatError('APPOINTMENT_UPDATE_FAILED'));
        }

        //will be updated only one appointment due to where condition
        const appointment = _this.mapAddedResponse(result[0]);
        return Promise.resolve(appointment);
      });
  },

  /**
   * Retuns formatted query that is dependent on startDateTime
   * @param {string} [startDateTime] - startDateTime of payload if present
   * @returns {Object} - Query to use to update with time
   */
  getTimeRelatedQuery(startDateTime) {
    let updateTimeAndSeatQuery = '';
    let fromQuery = '';
    let timeFilter = '';
    if (startDateTime) {

      updateTimeAndSeatQuery = `
      start_date__c = :startDateTime,
      end_date__c = (:startDateTime)::timestamp + ( :duration || ' minutes')::interval,
      seat__r__sid__c = "SE"."seatSid",
      `;

      fromQuery = `
      FROM
        ${utils.tableWithSchema('fn_get_appointment_availability_with_seat_detail')}(
        :calendarSid,
        :startDateTime,
        (:startDateTime)::timestamp + ('12 hours')::interval,
        :duration
        ) AS "SE"`;

      timeFilter = 'AND "SE"."startDateTime" = :startDateTime ';

    }

    return {updateTimeAndSeatQuery, fromQuery, timeFilter};
  },

  /**
   * List appointments between two dates
   * @param {Object} data - Data required for list
   * @param {string} data.accountSid - Account Sid related to appointment
   * @param {string} data.startDate - Start Date to list the appointment
   * @param {string} data.endDate - End Date to list the appointment
   * @param {string} [data.calendarSid] - Sid of the calendar to filter with
   * @param {string} [data.locationSid] - Sid of the location to filter with
   * @returns {Promise<Object>} - List of appointments
   */
  listDateWiseAppointment(data) {
    const validationSchema = [{
      accountSid: 'sid.required',
      locationSid: 'sid',
      calendar: 'sid',
      startDate: 'date.required',
      endDate: 'date.required'
    }];
    try {
      utils.validateArguments(arguments, validationSchema);
    } catch (error) {
      return Promise.reject(error);
    }

    const startDate = moment(data.startDate);
    const endDate = moment(data.endDate);

    if (endDate.diff(startDate, 'days') > 31) {
      return Promise.reject(errorResponse.formatError('DATE_RANGE_IS_GREATER_THAN_MONTH'));
    }

    const replacements = {
      startDate: data.startDate,
      endDate: data.endDate,
      accountSid: data.accountSid,
      locationSid: data.locationSid,
      calendarSid: data.calendarSid
    };
    const queryOptions = {
      replacements,
      type: Sequelize.QueryTypes.SELECT
    };

    const calendarFilter = data.calendarSid
      ? 'AND AP.calendar__r__sid__c = :calendarSid'
      : '';

    const locationFilter = data.locationSid
      ? 'AND SL.sid__c = :locationSid'
      : '';


    const query = `
          SELECT
            date,
            AP.sid__c as "sid",
            AP.calendar__r__sid__c as "calendar.sid",
            CL.title__c as "calendar.title",
            AP.seat__r__sid__c as "seat.sid",
            SE.title__c as "seat.title",
            SE.description__c as "seat.description",
            AP.start_date__c as "startDate",
            AP.end_date__c as "endDate",
            (DATE_PART('day', AP.end_date__c - AP.start_date__c) * 24 +
            DATE_PART('hour', AP.end_date__c - AP.start_date__c)) * 60 +
            DATE_PART('minute', AP.end_date__c - AP.start_date__c) as duration,
            AP.first_name__c as "firstName",
            AP.last_name__c as "lastName",
            AP.email__c as "email",
            AP.phone__c as "phone",
            AP.metadata__c as "metadata",
            AP.notes__c as "notes",
            AP.internal_notes__c as "internalNotes",
            AP.external_id__c as "externalId",
            AP.external_system__c as "externalSystem",
            AP.createddate,
            AP.lastmodifieddate
          FROM
            generate_series(date_trunc('day', timestamp :startDate),date_trunc('day', timestamp :endDate),(1||' day')::interval) date
          LEFT JOIN
            ${utils.tableWithSchema('sc_appointment__c')} AP
          ON
            date_trunc('day', AP.start_date__c) = date
          AND
            AP.status__c = 'scheduled'
            ${calendarFilter}
          JOIN
            ${utils.tableWithSchema('sc_calendar__c')} CL
          ON
            CL.sid__c = AP.calendar__r__sid__c
          JOIN
            ${utils.tableWithSchema('sc_seat__c')} SE
          ON
            SE.sid__c = AP.seat__r__sid__c
          JOIN
            ${utils.tableWithSchema('sc_location__c')} SL
          ON
            SL.sid__c = CL.scheduling_location__r__sid__c
            ${locationFilter}
        JOIN
          ${utils.tableWithSchema('sc_account__c')} SA
        ON
          SL.scheduling_account__r__sid__c = SA.sid__c
        AND
          SA.sid__c = :accountSid
        ORDER BY date, AP.start_date__c, AP.end_date__c`;

    return herokuData
      .runQuery(query, queryOptions)
      .then((response) => {
        const results = {};
        const count = response.length;

        response.forEach((appointment) => {
          const date = moment(appointment.date).format('YYYY-MM-DD');
          const appointmentList = results[date] || [];
          appointmentList.push(object2Dot.rebuild(appointment));
          results[date] = appointmentList;
        });

        return Promise.resolve({
          results,
          count,
          total: count
        });
      });
  }
};

module.exports = appointmentService;
