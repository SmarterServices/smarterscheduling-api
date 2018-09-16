'use strict';


const accountHandler = {

  /**
   * Add account handler
   * @param {Object} data - Request data
   * @param {Function} callback - Callback for handling response
   */
  addAccount: function () {
  }, /*function addAccount(data, callback) {

    //Call the service to get the data from DB
    AccountService
      .addAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },*/

  /**
   * List account handler
   * @param {Object} data - Request data
   * @param {Function} callback - Callback for handling response
   */
  listAccount: function listAccount(data, callback) {
  },

  /**
   * Get account handler
   * @param {Object} data - Request data
   * @param {Function} callback - Callback for handling response
   */
  getAccount: function () {
  }, /*function getAccount(data, callback) {

    //Call the service to get the data from DB
    AccountService
      .getAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },*/

  /**
   * Update account handler
   * @param {Object} data - Request data
   * @param {Function} callback - Callback for handling response
   */
  updateAccount: function () {
  }, /*function updateAccount(data, callback) {

    //Call the service to get the data from DB
    AccountService
      .updateAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },*/

  /**
   * Delete account handler
   * @param {Object} data - Request data
   * @param {Function} callback - Callback for handling response
   */
  deleteAccount: function () {
  }/*function deleteAccount(data, callback) {

    //Call the service to get the data from DB
    AccountService
      .deleteAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  }*/

};

module.exports = accountHandler;
