'use strict';
const schema = require('./schema/calendar-seat');
const customSchema = require('./custom-schema/calendar-seat');
const validation = require('./validation/calendar-seat');
const customValidation = require('./custom-validation/calendar-seat');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('sc_calendar_seat__c',
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
