'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const config = require('config');
const herokuData = require('../middleware/db-connection');
const utils = require('./../helpers/utils');
const scriptOrders = config.databases[0].scriptOrder;

const defaultSchemaName = config.databases[0].schema;

const dbInformation = {

  /**
   * Run each of the script in scripts directory
   * @param {string} [schemaName] - Optional name of the schema to be used
   * @param {string} [scriptPath] - Optional Script path
   * @param {Array.<String>} [specificFileNames] - run specific files instead of running all sql file
   * @returns {Promise.<T>} - Resolves with result of SQL scripts
   */
  runScripts: function (schemaName, scriptPath, specificFileNames) {
    scriptPath = scriptPath || path.resolve(__dirname + '/../../db');
    schemaName = schemaName || defaultSchemaName;
    let files = fs.readdirSync(scriptPath);
    let promises = Promise.resolve();
    const sqlFilePattern = /.+\.sql$/;
    const replacements = [{
      placeholder: _.escapeRegExp('%schemaName%'),
      value: schemaName
    }];

    //Srt the scripts based on priority
    files = this.sortScripts(files);

    files.forEach(fileName => {
      const runSpecificFile = specificFileNames
        ? specificFileNames.indexOf(fileName) !== -1
        : true;
      if (sqlFilePattern.test(fileName) && runSpecificFile) {

        const filePath = path.resolve(scriptPath + '/' + fileName);
        promises = promises
          .then(function () {
            return utils
              .readSQLFile(filePath, replacements);
          })
          .then(query => {
            return herokuData
              .runQuery(query);
          });

      }
    });

    return promises;
  },

  /**
   * Sort script paths by priority set in the configuration
   * @param {Array} scriptPaths - List of path to the scripts
   * @returns {Array} - A list of sorted paths
   */
  sortScripts: function (scriptPaths) {
    return _.sortBy(scriptPaths, scriptPath => {
      const fileName = path.basename(scriptPath);

      return scriptOrders.hasOwnProperty(fileName)
        ? scriptOrders[fileName]
        : Infinity;
    });
  }
};


module.exports = dbInformation;

