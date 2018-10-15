'use strict';
const schema = require('./schema/calendar');
const customSchema = require('./custom-schema/calendar');
const validation = require('./validation/calendar');
const customValidation = require('./custom-validation/calendar');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('sc_calendar__c',
    Object.assign(schema, customSchema),
    {
      schema: schemaName,
      timestamps: true,
      createdAt: 'createdDate',
      updatedAt: 'lastModifiedDate',
      freezeTableName: true,
      validate: Object.assign(validation, customValidation)
    });
};
