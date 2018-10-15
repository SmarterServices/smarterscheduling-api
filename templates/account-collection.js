'use strict';

module.exports = (json, {account, endpoint, query}) => {
  json.set(json.partial('pagination', {
    page: {
      endpoint,
      query,
      total: account.total,
      count: account.results.length
    }
  }));
  json.set('results', json.array(account.results, (json, item) => {
    json.set(json.partial('account', { account: item}));
  }));
};
