'use strict';

module.exports = (json, {exclusion, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: exclusion.total,
      count: exclusion.results.length
    }
  }));
  json.set('results', json.array(exclusion.results, (json, item) => {
    json.set(json.partial('exclusion', { exclusion: item}));
  }));
};
