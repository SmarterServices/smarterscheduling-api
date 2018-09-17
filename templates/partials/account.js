'use strict';

module.exports = (json, {account}) => {
  json.set('id', account.id);
  json.set('isDeleted', account.isDeleted);
  json.set('name', account.name);
  json.set('createdDate', account.createdDate);
  json.set('lastModifiedDate', account.lastModifiedDate);
  json.set('systemModstamp', account.systemModstamp);
  json.set('sid', account.sid);
  json.set('title', account.title);
  json.set('externalId', account.externalId);
};
