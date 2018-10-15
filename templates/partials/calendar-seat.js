'use strict';

module.exports = (json, {calendarSeat}) => {
  json.set('id', calendarSeat.id);
  json.set('isDeleted', calendarSeat.isDeleted);
  json.set('name', calendarSeat.name);
  json.set('createdDate', calendarSeat.createdDate);
  json.set('lastModifiedDate', calendarSeat.lastModifiedDate);
  json.set('systemModstamp', calendarSeat.systemModstamp);
  json.set('sid', calendarSeat.sid);
  json.set('calendar', calendarSeat.calendar);
  json.set('calendarRSid', calendarSeat.calendarRSid);
  json.set('seat', calendarSeat.seat);
  json.set('seatRSid', calendarSeat.seatRSid);
};
