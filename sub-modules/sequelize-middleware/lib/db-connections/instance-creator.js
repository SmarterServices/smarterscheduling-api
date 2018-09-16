'use strict';

/**
 * Exports an extended version of seqeulize instance
 * with ability to switch between other connections
 **/

const Sequelize = require('sequelize');
const dbConfig = undefined;
const Logger = require('node-logger');

let dbLogger = false;

require('pg')
  .types
  .setTypeParser(1114, function (stringValue) {
    return new Date(stringValue + '+0000');
  });

module.exports = {
  /**
   * Creates a sequelize instance from database config
   * @param {Object} dbConfig - Required database configurations
   * @param {Object} dbConfig.logger - logger in configurations
   * @param {string} dbConfig.dialect - Dialect of database connection
   * @param {string} dbConfig.protocol - Protocol of database connection
   * @param {boolean} dbConfig.ssl - ssl connection is established if true
   * @param {boolean} dbConfig.operatorsAliases - True if operators aliases is used
   * @param {Object} dbConfig.pool - Pool information of database connection
   * @param {string} dbConfig.uri - Uri of database
   * @param {string} dbConfig.host - Host name for launching server
   * @param {string} dbConfig.databaseName - Database name
   * @param {string} dbConfig.userName - User name
   * @param {string} dbConfig.password - password of the user
   * @returns {Sequelize} - Required sequelize instance of the given config
   */
  getInstance(dbConfig) {
    if (dbConfig.logger) {
      dbLogger = new Logger(dbConfig.logger);
    }
    const dbOptions = {
      logging: dbLogger && dbLogger.log.bind(dbLogger),
      dialect: dbConfig.dialect,
      protocol: dbConfig.protocol,
      ssl: dbConfig.ssl,
      operatorsAliases: dbConfig.operatorsAliases,
      dialectOptions: {
        ssl: dbConfig.ssl
      },
      pool: dbConfig.pool
    };

    if (dbConfig.uri) {
      return new Sequelize(dbConfig.uri, dbOptions);
    } else {
      dbOptions.host = dbConfig.host;
      return new Sequelize(dbConfig.databaseName, dbConfig.userName, dbConfig.password, dbOptions);
    }
  }
};
