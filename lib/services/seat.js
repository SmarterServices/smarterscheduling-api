'use strict';
const faker = require('faker');
const Sequelize = require('sequelize');

const herokuData = require('./../middleware/db-connection');
const utils = require('./../helpers/utils');

const Op = Sequelize.Op;

const seatService = {

  /**
   * Add seat service
   * @param {Object} data - The data to use for add
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to add
   * @returns {Promise} - Resolves with added data
   */
  addSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .addData('seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * List seat service
   * @param {Object} data - The data to use for list
   * @param {Object} data.params - Param values
   * @param {Object} data.query - Query parameter
   * @param {string} [data.query.limit] - Number of item to list
   * @param {string} [data.query.offset] - The offset to use for list
   * @param {string} [data.query.sortKey] - Key to use as sortKey while listing
   * @param {string} [data.query.sortOrder] - Sorting order
   * @returns {Promise} - Resolves with list of data
   */
  listSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .listData('seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Get seat service
   * @param {Object} data - The data to use for get
   * @param {Object} data.params - Param values
   * @returns {Promise} - Resolves with data that matches the criteria
   */
  getSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .getData('seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Update seat service
   * @param {Object} data - The data to use for update
   * @param {Object} data.params - Param values
   * @param {Object} data.payload - The payload to update
   * @returns {Promise} - Resolves with number of row that has been updated
   */
  updateSeat(data) {

    //call common DB method with model name to retrieve data
    return herokuData
      .updateData('seat', data)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Delete seat service
   * @param {Object} data - The data to use for delete
   * @param {Object} data.deletionList - Seats to delete
   * @returns {Promise} - Resolves with number of row that has been deleted
   */
  deleteSeat(data) {
    utils.validateArguments(arguments, [{deletionList: 'array.required'}]);

    const queryOptions = {
      where: {
        sid: {
          [Op.in]: data.deletionList
        }
      }
    };
    //call common DB method with model name to retrieve data
    return herokuData
      .deleteData('seat', data, queryOptions)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  },

  /**
   * Adds multiple seat
   * @param {number} numberOfSeats - Number of seats to be added
   * @param {string} locationSid - Location sid for seats
   * @returns {Promise} - Resolves with number of row that has been added
   */
  addMultipleSeat(numberOfSeats, locationSid) {
    utils.validateArguments(arguments, ['number.required', 'sid.required']);

    const bulkCreatePayload = [];

    for (let i = 0; i < numberOfSeats; i++) {
      const seatPayload = {
        schedulingLocationSid: locationSid,
        title: faker.commerce.color() + faker.random.number().toString()
      };
      bulkCreatePayload.push(seatPayload);
    }
    //call common DB method with model name to retrieve data
    return herokuData
      .bulkCreate('seat', {payload: bulkCreatePayload}, null)
      .then(function onSuccess(data) {
        return Promise.resolve(data);
      })
      .catch(function onError(error) {
        console.error(error.stack || error);
        return Promise.reject(error);
      });
  }
};

module.exports = seatService;
