'use strict';
const config = require('config');
const schema = require('./schema/schedule');
let customSchema = require('./custom-schema/schedule');
const validation = require('./validation/schedule');
let customValidation = require('./custom-validation/schedule');
const sequelize = require('../middleware/db-connection');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('sc_schedule__c',
    Object.assign(schema, customSchema),
    {
      schema: schemaName,
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdDate',
      updatedAt: 'lastModifiedDate',
      validate: Object.assign(validation, customValidation)
    });
};
