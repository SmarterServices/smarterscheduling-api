'use strict';

module.exports = (json, {account}) => {
  json.set('sid', account.sid);
  json.set('title', account.title);
  json.set('externalId', account.externalId);
  json.set('createdDate', account.createdDate);
  json.set('editDate', account.lastModifiedDate);
};
