'use strict';
const _ = require('lodash');
const herokuData = require('../middleware/db-connection');
const utils = require('./../helpers/utils');
const Sequelize = require('sequelize');

const accountService = {

  /**
   * Add account service
   */
  addAccount: function () {
  }, /*function addAccount(data) {
    return new Promise(function addAccountPromise(resolve, reject) {

      //call common DB method with model name to retrieve data
      herokuData
        .addData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },*/

  /**
   * Get account service
   * @param {Object} data - Data for retriving account
   * @returns {Promise} - Resolves with account
   */
  getAccount: function getAccount(data) {
    return new Promise(function getAccountPromise(resolve, reject) {

      //call common DB method with model name to retrieve data
      herokuData
        .getData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(error) {
          // console.error(error.stack || error);
          if (error.code === errorResponse.ERROR_LIST.DATA_NOT_FOUND.code) {
            error = errorResponse.formatError('ACCOUNT_NOT_FOUND');
          }
          reject(error);
        });
    });
  },

  /**
   * Update account service
   */
  updateAccount: function () {
  }, /*function updateAccount(data) {
    return new Promise(function updateAccountPromise(resolve, reject) {

      //call common DB method with model name to retrieve data
      herokuData
        .updateData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },*/

  /**
   * Delete account service
   */
  deleteAccount: function () {
  }/*function deleteAccount(data) {
    return new Promise(function deleteAccountPromise(resolve, reject) {

      //call common DB method with model name to retrieve data
      herokuData
        .deleteData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  }*/
};

module.exports = accountService;
