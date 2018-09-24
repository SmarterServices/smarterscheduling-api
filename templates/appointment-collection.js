'use strict';

module.exports = (json, {appointment, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: appointment.total,
      count: appointment.results.length
    }
  }));
  json.set('results', json.array(appointment.results, (json, item) => {
    json.set(json.partial('appointment', { appointment: item}));
  }));
};
