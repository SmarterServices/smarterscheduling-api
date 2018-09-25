'use strict';

module.exports = (json, {availability, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: availability.total,
      count: availability.results.length
    }
  }));
  json.set('results', json.array(availability.results, (json, item) => {
    json.set(json.partial('availability', { availability: item}));
  }));
};
