'use strict';

module.exports = (json, {appointmentAvailability}) => {
  json.set('results', json.array(appointmentAvailability.results, (json, item) => {
    json.set(json.partial('appointment-availability', { appointmentAvailability: item}));
  }));
};
