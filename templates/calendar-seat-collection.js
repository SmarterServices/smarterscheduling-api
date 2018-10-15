'use strict';

module.exports = (json, {calendarSeat, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: calendarSeat.total,
      count: calendarSeat.results.length
    }
  }));
  json.set('results', json.array(calendarSeat.results, (json, item) => {
    json.set(json.partial('calendar-seat', { calendarSeat: item}));
  }));
};
