'use strict';

module.exports = (json, {appointment}) => {
  json.set('id', appointment.id);
  json.set('isDeleted', appointment.isDeleted);
  json.set('name', appointment.name);
  json.set('createdDate', appointment.createdDate);
  json.set('lastModifiedDate', appointment.lastModifiedDate);
  json.set('systemModstamp', appointment.systemModstamp);
  json.set('sid', appointment.sid);
  json.set('seat', appointment.seat);
  json.set('seatRSid', appointment.seatRSid);
  json.set('calendar', appointment.calendar);
  json.set('calendarRSid', appointment.calendarRSid);
};
