'use strict';

module.exports = (json, {calendar}) => {
  json.set('sid', calendar.sid);
  json.set('locationSid', calendar.schedulingLocationSid);
  json.set('title', calendar.title);
  json.set('numberOfSeats', calendar.numberOfSeats);
  json.set('schedule', json => {
    json.set(json.partial('schedule', { schedule: calendar.schedule}));
  });
  json.set('createdDate', calendar.createdDate);
  json.set('editDate', calendar.lastModifiedDate);
};
