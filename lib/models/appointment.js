'use strict';
const schema = require('./schema/appointment');
let customSchema = require('./custom-schema/appointment');
const validation = require('./validation/appointment');
let customValidation = require('./custom-validation/appointment');

module.exports = function(sequelize, schemaName) {
  return sequelize.define('sc_appointment__c',
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
