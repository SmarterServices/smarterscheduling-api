'use strict';

const _ = require('lodash');
const sequelize = require('./../base-server').sequelize;
const server = require('./../base-server').server;
const Request = require('./request');
const request = new Request(server);
const utils = require('./../lib/helpers/utils');

const dataPopulate = {
  addByEndpoint: function addByEndpoint(url, payload) {
    return request
      .post(url)
      .send(payload)
      .end()
      .then(response => {
        if (response.statusCode !== 200) {
          throw Error(response.payload);
        } else {
          return Promise.resolve(response.result);
        }
      });
  },
  updateByEndpoint: function updateByEndpoint(url, payload) {
    return request
      .put(url)
      .send(payload)
      .end()
      .then(response => {
        if (response.statusCode !== 200) {
          throw Error(response.payload);
        } else {
          return Promise.resolve(response.result);
        }
      });
  },
  getByEndpoint: function getByEndpoint(url) {
    return request
      .get(url)
      .end()
      .then(response => {
        if (response.statusCode !== 200) {
          throw Error(response.payload);
        } else {
          return Promise.resolve(response.result);
        }
      });
  },
  createExtension: function createExtension(extensionName) {
    const query = `CREATE EXTENSION IF NOT EXISTS ${extensionName}`;
    return sequelize.query(query);
  },
  dropIsDeletedConstraint: function (tableName) {
    const query = `ALTER TABLE ${utils.tableWithSchema(tableName)} ALTER COLUMN isdeleted DROP NOT NULL`;

    return runQuery(query, {});
  }
};


/**
 * Runs the required query using sequelize
 * @param {string} query - Required query
 * @param {Object} queryOptions - Query options
 * @returns {Promise} - Resolves required data
 */
function runQuery(query, queryOptions) {
  return sequelize
    .query(query, queryOptions);
}

module.exports = dataPopulate;