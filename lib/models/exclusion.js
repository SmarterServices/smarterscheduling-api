'use strict';

const schema = require('./schema/exclusion');
const customSchema = require('./custom-schema/exclusion');
const validation = require('./validation/exclusion');
const customValidation = require('./custom-validation/exclusion');

module.exports = (sequelize, schemaName) => {
  return sequelize.define('sc_availability_exclusion__c',
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
