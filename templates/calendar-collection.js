'use strict';

module.exports = (json, {calendar, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: calendar.total,
      count: calendar.results.length
    }
  }));
  json.set('results', json.array(calendar.results, (json, item) => {
    json.set(json.partial('calendar', { calendar: item}));
  }));
};
