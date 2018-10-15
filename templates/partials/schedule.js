'use strict';

module.exports = (json, {schedule}) => {
  json.set('sid', schedule.sid);
  json.set('interval', schedule.interval);
  json.set('endBuffer', schedule.endBuffer);
};
