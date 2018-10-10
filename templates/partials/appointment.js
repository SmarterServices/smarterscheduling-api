'use strict';

module.exports = (json, {appointment}) => {
  json.set('sid', appointment.sid);
  json.set('seatSid', appointment.seatSid);
  json.set('calendarSid', appointment.calendarSid);
  json.set('startDateTime', appointment.startDate);
  json.set('endDateTime', appointment.endDate);
  json.set('firstName', appointment.firstName);
  json.set('lastName', appointment.lastName);
  json.set('email', appointment.email);
  json.set('phone', appointment.phone);
  json.set('externalId', appointment.externalId);
  json.set('externalSystem', appointment.externalSystem);
  json.set('notes', appointment.notes);
  json.set('internalNotes', appointment.internalNotes);
  json.set('metadata', appointment.metadata);
  json.set('duration', appointment.duration);

  json.setIfSidExist('calendar', appointment.calendar, 'calendar', 'calendar');
  json.setIfSidExist('seat', appointment.seat, 'seat', 'seat');
};
