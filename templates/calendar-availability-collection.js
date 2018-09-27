'use strict';

const _ = require('lodash');

module.exports = (json, {availability, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: null,
      count: 0
    }
  }));

  const results = availability.results;
  const availabilityResults = {};

  _.forEach(results, (value, key) => {
    availabilityResults[key] = json.array(value, (json, item) => {
      json.set(json.partial('availability', {availability: item}));
    });
  });


  json.set('results', availabilityResults);
};
