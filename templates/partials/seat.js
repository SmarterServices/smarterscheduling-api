'use strict';

module.exports = (json, {seat}) => {
  json.set('id', seat.id);
  json.set('isDeleted', seat.isDeleted);
  json.set('name', seat.name);
  json.set('createdDate', seat.createdDate);
  json.set('lastModifiedDate', seat.lastModifiedDate);
  json.set('systemModstamp', seat.systemModstamp);
  json.set('sid', seat.sid);
  json.set('title', seat.title);
  json.set('description', seat.description);
  json.set('schedulingLocation', seat.schedulingLocation);
  json.set('schedulingLocationSid', seat.schedulingLocationSid);
};
