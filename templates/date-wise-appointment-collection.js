'use strict';

module.exports = (json, {appointment, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: appointment.total,
      count: appointment.count
    }
  }));

  const results = appointment.results;
  const dates = Object.keys(results);

  json.set('results', json => {
    dates.forEach((date) => {
      json.set(date, json.array(results[date], (json, item) => {
        json.set(json.partial('appointment', {appointment: item}));
      }));

    });
  });
};
