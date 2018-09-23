'use strict';
const config = require('config');
const schema = require('./schema/availability');
let customSchema = require('./custom-schema/availability');
const validation = require('./validation/availability');
let customValidation = require('./custom-validation/availability');
const sequelize = require('../middleware/db-connection');

module.exports = sequelize.define('sc_availability__c',
  Object.assign(schema, customSchema),
  {
    schema: config.database.schema,
    timestamps: true,
    createdAt: 'createdDate',
    updatedAt: 'lastModifiedDate',
    freezeTableName: true,
    validate: Object.assign(validation, customValidation)
  });