'use strict';

module.exports = (json, {location}) => {
  json.set('id', location.id);
  json.set('isDeleted', location.isDeleted);
  json.set('name', location.name);
  json.set('createdDate', location.createdDate);
  json.set('lastModifiedDate', location.lastModifiedDate);
  json.set('systemModstamp', location.systemModstamp);
  json.set('schedulingAccount', location.schedulingAccount);
  json.set('schedulingAccountRSid', location.schedulingAccountRSid);
  json.set('sid', location.sid);
  json.set('externalId', location.externalId);
  json.set('title', location.title);
  json.set('seatManagement', location.seatManagement);
};
