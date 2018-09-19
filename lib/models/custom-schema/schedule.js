'use strict';
const Sequelize = require('sequelize');
const utils = require('./../../helpers/utils');

module.exports = {
  sid: {
    type: Sequelize.STRING(36),
    field: 'sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: utils.getNewId('schedule'),
    unique: true,
    references: null
  }
};
