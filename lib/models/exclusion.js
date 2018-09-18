'use strict';
const config = require('config');
const schema = require('./schema/exclusion');
let customSchema = require('./custom-schema/exclusion');
const validation = require('./validation/exclusion');
let customValidation = require('./custom-validation/exclusion');
const sequelize = require('../middleware/db-connection');

module.exports = sequelize.define('sc_availability_exclusion__c',
  Object.assign(schema, customSchema),
  {
    schema: config.database.schema,
    timestamps: true,
    createdAt: 'createdDate',
    updatedAt: 'lastModifiedDate',
    freezeTableName: true,
    validate: Object.assign(validation, customValidation)
  });