'use strict';
const schema = require('./schema/schedule');
const customSchema = require('./custom-schema/schedule');
const validation = require('./validation/schedule');
const customValidation = require('./custom-validation/schedule');

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
