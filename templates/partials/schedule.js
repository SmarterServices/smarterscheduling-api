'use strict';

module.exports = (json, {schedule}) => {
  json.set('id', schedule.id);
  json.set('isDeleted', schedule.isDeleted);
  json.set('name', schedule.name);
  json.set('createdDate', schedule.createdDate);
  json.set('lastModifiedDate', schedule.lastModifiedDate);
  json.set('systemModstamp', schedule.systemModstamp);
  json.set('sid', schedule.sid);
  json.set('interval', schedule.interval);
  json.set('endBuffer', schedule.endBuffer);
  json.set('seat', schedule.seat);
  json.set('seatRSid', schedule.seatRSid);
  json.set('calendar', schedule.calendar);
  json.set('calendarRSid', schedule.calendarRSid);
};
