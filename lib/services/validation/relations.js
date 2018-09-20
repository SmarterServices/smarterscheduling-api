'use strict';

const calendar = {
  foreignKey: 'calendarSid'
};

const exclusion = {
  foreignKey: 'exclusionSid'
};

const location = {
  foreignKey: 'schedulingLocationSid',
  children: {
    calendar: {relation: calendar}
  }
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
