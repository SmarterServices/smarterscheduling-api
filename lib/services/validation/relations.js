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
};

module.exports = relations;
