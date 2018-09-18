'use strict';
const Sequelize = require('sequelize');
const utils = require('./../../helpers/utils');

module.exports = {
  sid: {
    type: Sequelize.STRING(36),
    field: 'sid__c',
    primaryKey: false,
    autoIncrement: false,
    defaultValue: utils.getNewId('availabilityExclusion'),
    unique: true,
    references: null
  },
  name: {
    type: Sequelize.STRING(80),
    field: 'name',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  schedulingAccount: {
    type: Sequelize.STRING,
    field: 'scheduling_account__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  recurring: {
    type: Sequelize.STRING,
    field: 'recurring__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }
};
