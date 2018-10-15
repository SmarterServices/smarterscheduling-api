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
  schedulingAccount: {
    type: Sequelize.STRING,
    field: 'scheduling_account__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  schedulingAccountSid: {
    type: Sequelize.STRING,
    field: 'scheduling_account__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  schedulingLocation: {
    type: Sequelize.STRING,
    field: 'scheduling_location__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  schedulingLocationSid: {
    type: Sequelize.STRING,
    field: 'scheduling_location__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  schedule: {
    type: Sequelize.STRING,
    field: 'schedule__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  scheduleSid: {
    type: Sequelize.STRING,
    field: 'schedule__r__sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  title: {
    type: Sequelize.STRING(255),
    field: 'title__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  startDate: {
    type: Sequelize.DATEONLY,
    field: 'start_date__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
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
  startTime: {
    type: Sequelize.TIME,
    field: 'start_time__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  endTime: {
    type: Sequelize.TIME,
    field: 'end_time__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
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
  recurring: {
    type: Sequelize.STRING,
    field: 'recurring__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  },
  externalSystem: {
    type: Sequelize.STRING(255),
    field: 'external_system__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  },
  externalId: {
    type: Sequelize.STRING(255),
    field: 'external_id__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }
};
