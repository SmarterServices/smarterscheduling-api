'use strict';

module.exports = (json, {appointmentAvailability}) => {
  json.set('startDateTime', appointmentAvailability.startDateTime);
  json.set('endDateTime', appointmentAvailability.endDateTime);
  json.set('duration', appointmentAvailability.duration);
  json.set('seatCount', appointmentAvailability.seatCount);
};
