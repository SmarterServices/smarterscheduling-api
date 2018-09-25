'use strict';
const herokuData = require('./../middleware/db-connection');
const Sequelize = require('sequelize');
const utils = require('./../helpers/utils');

const scheduleService = {

  /**
   * Add schedule service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addSchedule(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('schedule', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List schedule service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listSchedule(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('schedule', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get schedule service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getSchedule(data) {
    const queryOptions = ['calendarSid'];
    const query = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('schedule', data, query)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        if (error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code) {
          const options = {
            values: {
              locationSid: data.sid || data.scheduleSid
            }
          };
          error = errorResponse.formatError('SCHEDULE_NOT_FOUND', options);
        } else {
          console.error(error.stack || error);
        }
        return Promise.reject(error);
      });
  },

  /**
   * Update schedule service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateSchedule(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('schedule', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete schedule service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteSchedule(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('schedule', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Validates the relation between account and schedule
   * @param {string} accountSid - Sid of the account
   * @param {string} scheduleSid - Sid of the schedule
   * @returns {Promise} - Empty Promise
   */
  validateScheduleAndAccount(accountSid, scheduleSid) {
    const validationSchema = [
      'sid.required',
      'sid.required'
    ];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const queryReplacements = {scheduleSid, accountSid};

    const queryOptions = {
      type: Sequelize.QueryTypes.SELECT,
      replacements: queryReplacements
    };
    const query = `
      SELECT
        *
      FROM
        ${utils.tableWithSchema('sc_schedule__c')} AS SC
      JOIN
        ${utils.tableWithSchema('sc_calendar__c')} AS CL
      ON
        SC.calendar__r__sid__c = CL.sid__c
      JOIN
        ${utils.tableWithSchema('sc_location__c')} AS SL
      ON
        CL.scheduling_location__r__sid__c = SL.sid__c
      JOIN
        ${utils.tableWithSchema('sc_account__c')} AS SA
      ON
        SL.scheduling_account__r__sid__c = SA.sid__c
      WHERE
        SC.sid__c = :scheduleSid
      AND
        SA.sid__c = :accountSid
    `;

    return herokuData
      .runQuery(query, queryOptions)
      .then(function onSuccess(response) {

        if (!response.length) {
          const errorOptions = {
            values: {
              scheduleSid,
              schedulingAccountSid: accountSid
            }
          };
          return Promise.reject(errorResponse.formatError('SCHEDULE_NOT_FOUND_UNDER_ACCOUNT', errorOptions));
        }

        return Promise.resolve();
      });
  }
};

module.exports = scheduleService;
