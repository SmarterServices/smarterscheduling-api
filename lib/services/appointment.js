'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

        return Promise.resolve(result[0]);
      });

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
  }
};

module.exports = appointmentService;
