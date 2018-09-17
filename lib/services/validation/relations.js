'use strict';

const location = {
  foreignKey: 'locationSid'
};

const relations = {
  account: {
    foreignKey: 'schedulingAccountSid',
    children: {
      location: {
        relation: location
      }
    }
  },
};

module.exports = relations;
