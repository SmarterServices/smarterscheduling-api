'use strict';

module.exports = (json, {availability}) => {
  json.set('id', availability.id);
  json.set('isDeleted', availability.isDeleted);
  json.set('name', availability.name);
  json.set('createdDate', availability.createdDate);
  json.set('lastModifiedDate', availability.lastModifiedDate);
  json.set('systemModstamp', availability.systemModstamp);
  json.set('sid', availability.sid);
  json.set('schedule', availability.schedule);
  json.set('scheduleRSid', availability.scheduleRSid);
  json.set('startDate', availability.startDate);
  json.set('endDate', availability.endDate);
  json.set('dayOfWeek', availability.dayOfWeek);
  json.set('startTime', availability.startTime);
  json.set('endTime', availability.endTime);
  json.set('recurring', availability.recurring);
};
