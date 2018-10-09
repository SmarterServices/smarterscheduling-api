'use strict';
const _ = require('lodash');
const moment = require('moment');


const herokuData = require('../middleware/db-connection');
const utils = require('./../helpers/utils');

const sequelize = herokuData.getConnection();
const Op = sequelize.Op;


const availabilityService = {

  /**
   * Add availability service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Creates, updates and deletes availability
   * @param {Object} data - ScheduleSid with payload
   * @param {string} data.scheduleSid - Sid of schedule
   * @param {Object} data.payload - Payload to use for batch operation
   * @param {Array<Object>} data.payload.create - Availabilities to create
   * @param {Array<Object>} data.payload.update - Availabilities to update
   * @param {Array<Object>} data.payload.delete - Availabilities to delete
   * @returns {Promise} - Availabilities
   */
  batchModifyAvailability(data) {
    const validationSchema = [{
      scheduleSid: 'string.required',
      payload: {
        create: 'array.required',
        update: 'array.required',
        delete: 'array.required',
      }
    }];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const _this = this;
    return _this
      .formatAvailabilities(data)
      .then(({toCreate, toUpdate, toDelete}) => {
        return sequelize
          .transaction(() => {

            const createPromise = toCreate.length
              ? _this.batchAddAvailability(toCreate)
              : Promise.resolve([]);

            const updatePromise = toUpdate.length
              ? _this.batchUpdateAvailability(toUpdate)
              : Promise.resolve([]);

            const deletePromise = toDelete.length
              ? _this.batchDeleteAvailability(toDelete)
              : Promise.resolve([]);

            return utils.wrapValidation([createPromise, deletePromise, updatePromise]);
          });
      });
  },

  /**
   * Format availabilities for further operation
   * @param {Object} data - ScheduleSid with payload
   * @param {string} data.scheduleSid - Sid of schedule
   * @param {Object} data.payload - Payload to use for batch operation
   * @param {Array<Object>} data.payload.create - Availabilities to create
   * @param {Array<Object>} data.payload.update - Availabilities to update
   * @param {Array<Object>} data.payload.delete - Availabilities to delete
   * @returns {Promise<Object>} - Formatted availabilities
   */
  formatAvailabilities(data) {
    const validationSchema = [{
      scheduleSid: 'string.required',
      payload: {
        create: 'array.required',
        update: 'array.required',
        delete: 'array.required',
      }
    }];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const _this = this;
    const scheduleSid = data.scheduleSid;
    const toCreate = _this.mapValues(data.payload.create, scheduleSid);
    const toUpdate = _this.mapValues(data.payload.update, scheduleSid);
    const toDelete = _this.mapValues(data.payload.delete, scheduleSid);
    return Promise.resolve({toCreate, toUpdate, toDelete});
  },

  /**
   * Sets default endDate if necessary and scheduleSid to each availability
   * @param {Array<Object>} availabilities - List of availability
   * @param {string} scheduleSid - Sid of schedule
   * @returns {Array<Object>} - Array of mapped Availabilities
   */
  mapValues(availabilities, scheduleSid) {
    const validationSchema = ['array.required', 'string.required'];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const DEFAULT_END_DATE = '2070-01-01';

    const mappedAvailabilities = availabilities.map((availability) => {
      availability.scheduleSid = scheduleSid;
      if (!availability.endDate) {
        availability.endDate = DEFAULT_END_DATE;
      }
      if (!availability.recurring) {
        availability.recurring = 'weekly';
      }
      return availability;
    });

    return mappedAvailabilities;
  },

  /**
   * Performs batch add operation
   * @param {Array<Object>} payload - Payload to add
   * @returns {Promise<Object>} - Added response
   */
  batchAddAvailability(payload) {
    const validationSchema = [[{
      scheduleSid: 'string.required',
      startDate: 'string.required',
      endDate: 'string.required',
      dayOfWeek: 'number.required',
      startTime: 'string.required',
      endTime: 'string.required',
      recurring: 'string.required'
    }]];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    return herokuData
      .bulkCreate('availability', {payload}, null)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      });
  },

  /**
   * Batch updates availability
   * @param {Array<Object>} data - availability to update
   * @param {string} data[].scheduleSid - Sid of schedule
   * @returns {Promise<Object>} - Updated data
   */
  batchUpdateAvailability(data) {
    const validationSchema = [[{
      scheduleSid: 'string.required',
      sid: 'string.required',
      startDate: 'string.required',
      endDate: 'string.required',
      dayOfWeek: 'number.required',
      startTime: 'string.required',
      endTime: 'string.required',
      recurring: 'string.required'
    }]];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const dbSchema = utils.tableWithSchema('sc_availability__c');
    const queryIn = [];
    const replacements = {scheduleSid: data[0].scheduleSid};
    const queryCases = {
      startDate: '',
      endDate: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      recurring: ''
    };
    const typeTimestamp = {
      valueType: 'timestamp'
    };
    const typeTime = {
      valueType: 'time'
    };
    const typeNumber = {
      valueType: 'number'
    };

    //loop through items to add in query cases
    data.forEach(function forEachItem(item) {
      const sid = item.sid;
      queryCases.startDate += utils.getQueryCase(sid, item.startDate, replacements, typeTimestamp);
      queryCases.endDate += utils.getQueryCase(sid, item.endDate, replacements, typeTimestamp);
      queryCases.dayOfWeek += utils.getQueryCase(sid, item.dayOfWeek, replacements, typeNumber);
      queryCases.startTime += utils.getQueryCase(sid, item.startTime, replacements, typeTime);
      queryCases.endTime += utils.getQueryCase(sid, item.endTime, replacements, typeTime);
      queryCases.recurring += utils.getQueryCase(sid, item.recurring, replacements);
      queryIn.push(`'${sid}'`);
    });

    const query = `
      UPDATE
      ${dbSchema}
     SET
       start_date__c = CASE sid__c ${queryCases.startDate}  END,
       end_date__c = CASE sid__c ${queryCases.endDate}  END,
       day_of_week__c = CASE sid__c ${queryCases.dayOfWeek}  END,
       start_time__c = CASE sid__c ${queryCases.startTime}  END,
       end_time__c = CASE sid__c ${queryCases.endTime}  END,
       recurring__c = CASE sid__c ${queryCases.recurring} END
      WHERE sid__c IN (${queryIn.join(', ')})
      AND schedule__r__sid__c = :scheduleSid`;

    const queryOptions = {
      type: sequelize.QueryTypes.UPDATE,
      replacements: replacements
    };

    return herokuData
      .runQuery(query, queryOptions)
      .then(function onSuccess(returnedData) {
        return Promise.resolve({
          results: returnedData
        });
      })
      .catch(function onError(ex) {
        console.error(ex.stack || ex);
        return Promise.reject(ex);
      });

  },

  /**
   * Performs batch deletes for payload
   * @param {Array<Object>} payload - Payload to add
   * @param {string} payload[].sid - Sid to delete
   * @param {string} payload[].scheduleSid - Sid of the schedule
   * @returns {Promise<Object>} - Delete response
   */
  batchDeleteAvailability(payload) {
    const validationSchema = [[{
      scheduleSid: 'string.required',
      sid: 'string.required'
    }]];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const sidsToDelete = _.map(payload, 'sid');
    const deletionQuery = {
      where: {
        [Op.and]: {
          sid: {
            [Op.in]: sidsToDelete
          },
          scheduleSid: payload[0].scheduleSid
        }
      }
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('availability', null, deletionQuery)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        if (error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code) {
          const options = {
            values: {
              availabilitySid: sidsToDelete.join(', ')
            }
          };
          error = errorResponse.formatError('AVAILABILITY_LIST_NOT_FOUND', options);
        } else {
          console.error(error.stack || error);
        }
        return Promise.reject(error);
      });
  },

  /**
   * List availability service
   * @param {Object} data - The data to use for list
   * @param {Object} [data.scheduleSid] - Sid of the schedule
   * @param {string} [data.limit] - Number of item to list
   * @param {string} [data.offset] - The offset to use for list
   * @param {string} [data.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listAvailability(data) {
    const queryOptions = [
      ['scheduleSid']
    ];
    const queryCondition = {
      where: utils.getSequelizeCondition(queryOptions, data)
    };

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('availability', data, queryCondition)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get availability service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update availability service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete availability service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteAvailability(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('availability', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List calendar availability
   * @param {Object} data - Data from request
   * @param {string} data.calendarSid - CalendarSid
   * @param {string} data.startDate - Staring of date range
   * @param {string} data.endDate - Ending of date range
   * @returns {Promise<T>} Formatted availability
   */
  listCalendarAvailability(data) {
    const validationSchema = [{
      calendarSid: 'sid.required',
      startDate: 'string.required',
      endDate: 'string.required',
    }];
    //Validate the arguments
    utils.validateArguments(arguments, validationSchema);

    const queryOptions = {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        calendarSid: data.calendarSid,
        startDate: data.startDate + ' 00:00:00',
        endDate: data.endDate + ' 00:00:00'
      }
    };

    const query = `
SELECT
  distinct date_time,
  AV.sid__c AS "availabilitySid",
  AV.recurring__c AS "recurring",
  AV.day_of_week__c AS "dayOfWeek",
  AV.name AS "name",
  AV.schedule__r__sid__c AS "scheduleSid",
  AV.start_time__c AS "startTime",
  AV.end_time__c AS "endTime",
  AV.start_date__c AS "startDate",
  AV.end_date__c AS "endDate",
  AV.override__c AS "override"
FROM
  generate_series(date_trunc('day',
  TIMESTAMP :startDate),
  date_trunc('day',
  TIMESTAMP :endDate),
  (1 || ' day')::interval) AS date_time
JOIN ${utils.tableWithSchema('sc_calendar__c')} CL ON
  CL.sid__c = :calendarSid
JOIN ${utils.tableWithSchema('sc_calendar_seat__c')} CS ON
  CL.sid__c = CS.calendar__r__sid__c
JOIN ${utils.tableWithSchema('sc_seat__c')} SE ON
  CS.seat__r__sid__c = SE.sid__c
JOIN ${utils.tableWithSchema('sc_schedule__c')} SS ON
  SE.schedule__r__sid__c = SS.sid__c
  OR CL.sid__c = SS.calendar__r__sid__c
LEFT JOIN ${utils.tableWithSchema('sc_availability__c')} AV ON
  (extract(dow FROM date_time) = AV.day_of_week__c)
  AND (
    (AV.start_date__c is null)
    OR (AV.start_date__c is not null AND date_time between AV.start_date__c AND AV.end_date__c)
  )
  AND AV.schedule__r__sid__c = SS.sid__c
ORDER BY
  date_time,
  "startTime",
  "endTime"`;

    return herokuData
      .runQuery(query, queryOptions)
      .then((returnedData) => {
        return Promise.resolve({
          results: this.formatCalendarAvailability(returnedData)
        });
      })
      .catch(function onError(ex) {
        console.error(ex.stack || ex);
        return Promise.reject(ex);
      });
  },

  /**
   * Format db response of calendar availability
   * @param {Array} dbResponse - Response from db
   * @returns {Object} - Formatted response
   */
  formatCalendarAvailability(dbResponse) {
    //Validate the arguments
    utils.validateArguments(arguments, ['array.required']);

    const result = {};

    dbResponse.forEach((response) => {
      const day = moment(response.date_time).format('YYYY-MM-DD');
      const dayGroup = result[day] || [];

      if (response.availabilitySid) {
        dayGroup.push(response);
      }

      result[day] = dayGroup;
    });

    return result;
  }
};

module.exports = availabilityService;
