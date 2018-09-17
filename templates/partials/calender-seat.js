'use strict';

module.exports = (json, {calenderSeat}) => {
  json.set('id', calenderSeat.id);
  json.set('isDeleted', calenderSeat.isDeleted);
  json.set('name', calenderSeat.name);
  json.set('createdDate', calenderSeat.createdDate);
  json.set('lastModifiedDate', calenderSeat.lastModifiedDate);
  json.set('systemModstamp', calenderSeat.systemModstamp);
  json.set('sid', calenderSeat.sid);
  json.set('calendar', calenderSeat.calendar);
  json.set('calendarRSid', calenderSeat.calendarRSid);
  json.set('seat', calenderSeat.seat);
  json.set('seatRSid', calenderSeat.seatRSid);
};
