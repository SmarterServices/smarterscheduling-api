'use strict';
const schema = require('./schema/time-zones');
const customSchema = require('./custom-schema/time-zones');
const validation = require('./validation/time-zones');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('time_zones__c',
    Object.assign(schema, customSchema),
    {
      schema: schemaName,
      timestamps: true,
      freezeTableName: true,
      createdAt: 'createdDate',
      updatedAt: 'lastModifiedDate',
      validate: validation
    });
};
