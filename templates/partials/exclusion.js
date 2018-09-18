'use strict';

module.exports = (json, {exclusion}) => {
  json.set('id', exclusion.id);
  json.set('isDeleted', exclusion.isDeleted);
  json.set('name', exclusion.name);
  json.set('createdDate', exclusion.createdDate);
  json.set('lastModifiedDate', exclusion.lastModifiedDate);
  json.set('systemModstamp', exclusion.systemModstamp);
  json.set('sid', exclusion.sid);
  json.set('schedulingAccount', exclusion.schedulingAccount);
  json.set('schedulingAccountRSid', exclusion.schedulingAccountRSid);
  json.set('schedulingLocation', exclusion.schedulingLocation);
  json.set('schedulingLocationRSid', exclusion.schedulingLocationRSid);
  json.set('schedule', exclusion.schedule);
  json.set('scheduleRSid', exclusion.scheduleRSid);
  json.set('title', exclusion.title);
  json.set('startDate', exclusion.startDate);
  json.set('endDate', exclusion.endDate);
  json.set('startTime', exclusion.startTime);
  json.set('endTime', exclusion.endTime);
  json.set('dayOfWeek', exclusion.dayOfWeek);
  json.set('recurring', exclusion.recurring);
  json.set('externalSystem', exclusion.externalSystem);
  json.set('externalId', exclusion.externalId);
};
