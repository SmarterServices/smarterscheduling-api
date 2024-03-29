'use strict';
const appointment = {
  foreignKey: 'appointmentSid'
};

const exclusion = {
  foreignKey: 'exclusionSid'
};

const schedule = {
  foreignKey: 'scheduleSid',
  children: {}
};

const calendar = {
  foreignKey: 'calendarSid',
  children: {
    schedule: {relation: schedule},
    appointment: {relation: appointment},
  }
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
