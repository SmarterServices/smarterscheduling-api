'use strict';

const location = {
  foreignKey: 'locationSid'
};

const exclusion = {
  foreignKey: 'exclusionSid'
};

const relations = {
  account: {
    foreignKey: 'schedulingAccountSid',
    children: {
      location: {
        relation: location
      },
      exclusion: {
        relation: exclusion
      }
    }
  },
  messageThread: {
    foreignKey: 'messageSid'
  },
  proctorLocationType: {
    foreignKey: 'locationTypeSid'
  },
  currency: {
    primaryKey: 'code',
    foreignKey: 'currencyCode'
  }
};

module.exports = relations;
