'use strict';

module.exports = (json, {location}) => {
  json.set('sid', location.sid);
  json.set('accountSid', location.schedulingAccountSid);
  json.set('title', location.title);
  json.set('externalId', location.externalId);
  json.set('seatManagement', location.seatManagement);
  json.set('createdDate', location.createdDate);
  json.set('editDate', location.lastModifiedDate);
};
