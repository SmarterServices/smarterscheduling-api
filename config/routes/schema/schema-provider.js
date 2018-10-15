'use strict';

const Fs = require('fs');

const schema = {};
const mapping = {};

//joi Schema provider for each model available
const updateSchema = function () {
  const schemaFiles = Fs.readdirSync(__dirname);
  const jsFilePattern = /(.+).js/;

  schemaFiles.forEach(function forEachRouteFile(fileName) {
    let fileKey;

    //If they file is not this file
    if (fileName === 'schema-provider.js' || !(jsFilePattern.test(fileName)))
    {return;}

    fileKey = jsFilePattern.exec(fileName)[1];

    delete require.cache[require.resolve('./' + fileKey)];
    delete require.cache[require.resolve('./' + fileKey + '.json')];
    schema[fileKey] = require('./' + fileKey);
    mapping[fileKey] = require('./' + fileKey + '.json');

  });
};

updateSchema();

module.exports = {
  schema: schema,
  mapping: mapping,
  updateSchema: updateSchema
};
