'use strict';

module.exports = (json, {seat, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: seat.total,
      count: seat.results.length
    }
  }));
  json.set('results', json.array(seat.results, (json, item) => {
    json.set(json.partial('seat', { seat: item}));
  }));
};
