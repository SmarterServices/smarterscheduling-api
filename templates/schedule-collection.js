'use strict';

module.exports = (json, {schedule, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: schedule.total,
      count: schedule.results.length
    }
  }));
  json.set('results', json.array(schedule.results, (json, item) => {
    json.set(json.partial('schedule', { schedule: item}));
  }));
};
