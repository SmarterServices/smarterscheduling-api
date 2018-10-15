'use strict';

module.exports = (json, {location, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: location.total,
      count: location.results.length
    }
  }));
  json.set('results', json.array(location.results, (json, item) => {
    json.set(json.partial('location', { location: item}));
  }));
};
