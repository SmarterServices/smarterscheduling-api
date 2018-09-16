'use strict';
const schema = require('./schema/account');
const customSchema = require('./custom-schema/account');
const validation = require('./validation/account');

module.exports = function (sequelize, schemaName) {
  return sequelize.define('account',
    Object.assign(schema, customSchema),
    {
      schema: schemaName,
      timestamps: false,
      freezeTableName: true,
      validate: (function () {
        return Object.assign({
          //===========================
          //Your custom validation here
          //===========================
          /*
           test: function testValidation(){
           var validationError = falseaccount.js;
           if(validationError) {
           throw new Error('Something happened');
           }
           }
           */
        }, validation);
      })()
    });
};
