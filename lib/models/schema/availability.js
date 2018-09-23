'use strict';
const Sequelize = require('sequelize');

module.exports = {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  isDeleted: {
    type: Sequelize.BOOLEAN,
    field: 'isdeleted',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: false,
    unique: false,
    references: null
  },
  name: {
    type: Sequelize.STRING(80),
    field: 'name',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  createdDate: {
    type: Sequelize.DATE,
    field: 'createddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    unique: false,
    references: null
  },
  lastModifiedDate: {
    type: Sequelize.DATE,
    field: 'lastmodifieddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    unique: false,
    references: null
  },
  systemModstamp: {
    type: Sequelize.DATE,
    field: 'systemmodstamp',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    unique: false,
    references: null
  },
  sid: {
    type: Sequelize.STRING(36),
    field: 'sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: true,
    references: null
  },
  schedule: {
    type: Sequelize.STRING,
    field: 'schedule__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  scheduleSid: {
    type: Sequelize.STRING,
    field: 'schedule__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: undefined,
    defaultValue: null,
    unique: false,
    references: null
  },
  startDate: {
    type: Sequelize.DATEONLY,
    field: 'start_date__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  endDate: {
    type: Sequelize.DATEONLY,
    field: 'end_date__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  dayOfWeek: {
    type: Sequelize.DOUBLE,
    field: 'day_of_week__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  startTime: {
    type: Sequelize.STRING,
    field: 'start_time__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  endTime: {
    type: Sequelize.STRING,
    field: 'end_time__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
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