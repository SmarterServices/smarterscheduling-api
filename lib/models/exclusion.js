'use strict';

const schema = require('./schema/location');
const customSchema = require('./custom-schema/location');
const validation = require('./validation/location');
const customValidation = require('./custom-validation/location');

module.exports = (sequelize, schemaName) => {
  sequelize.define('sc_availability_exclusion__c',
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
