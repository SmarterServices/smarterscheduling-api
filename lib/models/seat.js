'use strict';
const schema = require('./schema/seat');
const customSchema = require('./custom-schema/seat');
const validation = require('./validation/seat');
const customValidation = require('./custom-validation/seat');

module.exports = function(sequelize, schemaName) {
  return sequelize.define('sc_seat__c',
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
