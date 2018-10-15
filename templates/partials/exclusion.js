'use strict';

const defaultEndDate = '2070-01-01';

module.exports = (json, {exclusion}) => {
  json.set('sid', exclusion.sid);
  json.set('title', exclusion.title);
  json.set('accountSid', exclusion.schedulingAccountSid);
  json.set('locationSid', exclusion.schedulingLocationSid);
  json.set('scheduleSid', exclusion.scheduleSid);
  json.set('startDate', exclusion.startDate);
  json.set('endDate', exclusion.endDate === defaultEndDate ? null : exclusion.endDate);
  json.set('dayOfWeek', exclusion.dayOfWeek);
  json.set('startTime', exclusion.startTime);
  json.set('endTime', exclusion.endTime);
  json.set('recurring', exclusion.recurring);
  json.set('externalSystem', exclusion.externalSystem);
  json.set('externalId', exclusion.externalId);
  json.set('createdDate', exclusion.createdDate);
  json.set('editDate', exclusion.lastModifiedDate);
};
