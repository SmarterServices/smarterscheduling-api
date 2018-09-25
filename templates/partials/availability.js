'use strict';

const DEFAULT_END_DATE = '2070-01-01';

module.exports = (json, {availability}) => {
  json.set('sid', availability.sid);
  json.set('scheduleSid', availability.scheduleSid);
  json.set('startDate', availability.startDate);
  json.set('endDate', availability.endDate === DEFAULT_END_DATE ? null : availability.endDate);
  json.set('dayOfWeek', availability.dayOfWeek);
  json.set('startTime', availability.startTime);
  json.set('endTime', availability.endTime);
  json.set('recurring', availability.recurring);
  json.set('createdDate', availability.createdDate);
  json.set('editDate', availability.lastModifiedDate);
};
