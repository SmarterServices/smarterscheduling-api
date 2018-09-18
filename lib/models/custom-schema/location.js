'use strict';
const Sequelize = require('sequelize');
const utils = require('./../../helpers/utils');

module.exports = {
//========================================
//Your custom schema goes here
//========================================
  sid: {
    type: Sequelize.STRING(36),
    field: 'sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: utils.getNewId('location'),
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
  }
};
