'use strict';

const DbConnection = require('sequelize-middleware');
const _ = require('lodash');
const config = require('config');

/**
 * Filter database errors based on feature flag
 * @param {Object} error - The incoming error
 * @returns {Promise} - Rejects error
 */
function filterDBErrors(error) {
  //Possibly will be replaced with launch darkly
  console.error(error.stack || error);
  return Promise.reject(error);
}

const dbConnectionConfig = {
  databases: config.databases,
  herokuConnect: config.herokuConnect
};
/// If database url is given in env object then it will be used as the primary database uri
if (process.env.NODE_ENV !== 'dev-test' && process.env.DATABASE_PRIMARY_URL) {
  _.set(dbConnectionConfig, 'databases[0].uri', process.env.DATABASE_PRIMARY_URL);
}

dbConnectionConfig.errorHandler = filterDBErrors;

// Creating a new instance of heroku connect with given configurations
module.exports = new DbConnection(dbConnectionConfig);
