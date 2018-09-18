'use strict';

module.exports = (json, {location}) => {
  json.set('sid', location.sid);
  json.set('title', location.title);
  json.set('externalId', location.externalId);
  json.set('schedulingAccountSid', location.schedulingAccountSid);
  json.set('seatManagement', location.seatManagement);
  json.set('createdDate', location.createdDate);
  json.set('lastModifiedDate', location.lastModifiedDate);
  json.set('systemModstamp', location.systemModstamp);
};
