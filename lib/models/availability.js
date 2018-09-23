'use strict';
const schema = require('./schema/availability');
const customSchema = require('./custom-schema/availability');
const validation = require('./validation/availability');
const customValidation = require('./custom-validation/availability');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('sc_availability__c',
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
