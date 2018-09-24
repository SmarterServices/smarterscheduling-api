'use strict';

module.exports = (json, {availability}) => {
  json.set('sid', availability.sid);
  json.set('scheduleSid', availability.scheduleSid);
  json.set('startDate', availability.startDate);
  json.set('endDate', availability.endDate);
  json.set('dayOfWeek', availability.dayOfWeek);
  json.set('startTime', availability.startTime);
  json.set('endTime', availability.endTime);
  json.set('recurring', availability.recurring);
  json.set('createdDate', availability.createdDate);
  json.set('ediDate', availability.lastModifiedDate);
};
