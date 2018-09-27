'use strict';

const _ = require('lodash');
const config = require('config');
const joi = require('joi');

const schemaDefinitions = require('./validation-rules');


module.exports = {
  /**
   * Validate function arguments
   * @param {Array} args - Arguments from function
   * @param {Object} validationSchema - Custom schema definition
   */
  validateArguments(args, validationSchema) {
    if (!config.checkFunctionParams) {
      return;
    }

    validationSchema.forEach((schemata, index) => {

      if (typeof schemata === 'string') {
        _validateValue(args[index], schemata);
      } else {
        _validateObject(args[index], schemata);
      }

    });
  }
};


/**
 * Validation schema that is going to be used to validate a single value
 * @param {Any} value - Value from the arguments
 * @param {Object} validationSchema - Custom schema to validate the value against
 * @private
 */
function _validateValue(value, validationSchema) {
  const schemaProps = validationSchema.split('.');

  const schemaName = schemaProps[0];
  const isRequired = schemaProps[1] === 'required';

  //Get the schema from schema definition or some default joi param
  let schema = schemaDefinitions[schemaName] || joi[schemaName]();

  //Include required if that's defined in the custom schema
  schema = isRequired ? schema.required() : schema.allow(null);

  const validationResult = joi.validate(value, schema);

  if (validationResult.error) {
    //Throw error if there's one
    throw new Error(validationResult.error);
  }
}


/**
 * Validation schema that is going to be used to validate an object
 * @param {Object} obj - Value from the arguments
 * @param {Object} validationSchema - Custom schema to validate the value against
 * @private
 */
function _validateObject(obj, validationSchema) {
  _.forEach(validationSchema, (schemaValue, key) => {
    if (typeof schemaValue === 'string') {
      _validateValue(obj[key], schemaValue);
    } else {
      _validateObject(obj[key], schemaValue);
    }
  });
}


