'use strict';

module.exports = (json, {calenderSeat, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: calenderSeat.total,
      count: calenderSeat.results.length
    }
  }));
  json.set('results', json.array(calenderSeat.results, (json, item) => {
    json.set(json.partial('calender-seat', { calenderSeat: item}));
  }));
};
