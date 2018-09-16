'use strict';

module.exports = (json, {account}) => {
  // json.set('masterRecordId', account.masterRecordId);
  json.set('sid', account.sid);
  json.set('name', account.name);
// json.set('parentId', account.parentId);
// json.set('createdDate', account.createdDate);
// json.set('systemModstamp', account.systemModstamp);
};
