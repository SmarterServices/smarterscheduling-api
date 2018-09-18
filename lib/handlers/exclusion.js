'use strict';

const exclusionService = require('./../services/exclusion');
const locationService = require('./../services/location');
const scheduleService = require('./../services/schedule');
const utils = require('./../helpers/utils');

const exclusionHandler = {

  /**
   * Add exclusion handler
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @param {Function} callback - Callback for handling response
   */
  addExclusion: function addExclusion(data, callback) {
    const _this = this;
    const payload = mapPostPayloadFields(data);

    //Call the service to get the data from DB
    _this
      .validatePostPayloadSids(payload)
      .then(() => {
        return exclusionService.addExclusion({payload});
      })
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * List exclusion handler
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @param {Function} callback - Callback for handling response
   */
  listExclusion: function listExclusion(data, callback) {

    //Call the service to get the data from DB
    exclusionService
      .listExclusion(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Get exclusion handler
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  getExclusion: function getExclusion(data, callback) {

    //Call the service to get the data from DB
    exclusionService
      .getExclusion(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Update exclusion handler
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @param {Function} callback - Callback for handling response
   */
  updateExclusion: function updateExclusion(data, callback) {

    //Call the service to get the data from DB
    exclusionService
      .updateExclusion(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Delete exclusion handler
   * @param {Object} data - The data to use for delete
   * @param {Object} data.params - Param values
   * @param {Function} callback - Callback for handling response
   */
  deleteExclusion: function deleteExclusion(data, callback) {

    //Call the service to get the data from DB
    exclusionService
      .deleteExclusion(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(error) {
        callback(error, null);
      });
  },

  /**
   * Validates sids of payload
   * @param {Object} data - Payload with sids
   * @param {Object} [data.schedulingLocationSid] - Sid of location
   * @param {Object} [data.schedulingAccountSid] - Sid of Account
   * @returns {Promise} - Validated Data
   */
  validatePostPayloadSids(data) {
    const promises = [];

    const locationOpts = {
      sid: data.schedulingLocationSid,
      accountSid: data.schedulingAccountSid
    };
    const scheduleOpts = {
      sid: data.scheduleSid
    };

    const locationPromise = locationOpts.sid ?
      locationService.getLocation(locationOpts)
      : Promise.resolve({});

    const schedulePromise = scheduleOpts.sid ?
      scheduleService.getSchedule(scheduleOpts)
      : Promise.resolve({});

    promises.push(locationPromise);
    promises.push(schedulePromise);

    return utils.wrapValidation(promises);
  }

};

module.exports = exclusionHandler;

/**
 * Maps payload Fields for adding data
 * @param {Object} data - Data that came in request
 * @param {Object} data.params - Param Values
 * @param {Object} data.payload- Payload data
 * @returns {Object} - Mapped payload
 */
function mapPostPayloadFields(data) {
  if (!data.payload.endDate) {
    data.payload.endDate = '2070-01-01';
  }
  data.payload.schedulingAccountSid = data.params.accountSid;
  data.payload.schedulingLocationSid = data.payload.locationSid;
  return data.payload;
}
