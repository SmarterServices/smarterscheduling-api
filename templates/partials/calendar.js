'use strict';

module.exports = (json, {calendar}) => {
  json.set('sid', calendar.sid);
  json.set('locationSid', calendar.schedulingLocationSid);
  json.set('title', calendar.title);
  json.set('numberOfSeats', calendar.numberOfSeats);
  json.setIfSidExist('schedule', calendar.schedule, 'schedule', 'schedule');
  json.set('createdDate', calendar.createdDate);
  json.set('editDate', calendar.lastModifiedDate);
};
