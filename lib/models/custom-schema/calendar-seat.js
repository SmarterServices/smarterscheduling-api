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
    defaultValue: utils.getNewId('calendar-seat'),
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
  calendar: {
    type: Sequelize.STRING,
    field: 'calendar__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  calendarSid: {
    type: Sequelize.STRING,
    field: 'calendar__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  seat: {
    type: Sequelize.STRING,
    field: 'seat__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  seatSid: {
    type: Sequelize.STRING,
    field: 'seat__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }
};
