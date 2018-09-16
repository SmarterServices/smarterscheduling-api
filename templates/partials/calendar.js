'use strict';

module.exports = (json, {calendar}) => {
  json.set('id', calendar.id);
  json.set('isDeleted', calendar.isDeleted);
  json.set('name', calendar.name);
  json.set('createdDate', calendar.createdDate);
  json.set('lastModifiedDate', calendar.lastModifiedDate);
  json.set('systemModstamp', calendar.systemModstamp);
  json.set('sid', calendar.sid);
  json.set('schedulingLocation', calendar.schedulingLocation);
  json.set('schedulingLocationRSid', calendar.schedulingLocationRSid);
  json.set('title', calendar.title);
};
