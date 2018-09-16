'use strict';

const _ = require('lodash');

const Validator = require('./../lib/services/validation/Validator');
const relations = require('./../lib/services/validation/relations');
const utils = require('./../lib/helpers/utils');


/**
 * Validates params
 * @param {Object} server
 * @param {Object} options
 * @param {Function} next
 */
exports.register = function validateParams(server, options, next) {
  server.ext('onPreHandler', function (request, reply) {
    const pluginOptions = request.route.settings.plugins;
    const validateOptions = pluginOptions.paramValidate;
    const requestData = {
      params: request.params,
      payload: request.payload
    };

    if (!validateOptions) {
      //if no validation option is found skip plugin
      return reply.continue();
    }
    let validationPromise;

    if (Array.isArray(validateOptions)) {
      //if the function is array
      //loop through and add to promise all
      const promises = [];
      for (let options of validateOptions) {
        promises.push(completeValidation(appendValidation(options, requestData), options, requestData));
      }
      validationPromise = utils.wrapValidation(promises);
    } else {
      validationPromise = completeValidation(appendValidation(validateOptions, requestData), validateOptions, requestData);
    }

    validationPromise
      .then((results) => {
        if (Array.isArray(results)) {
          request.paramValidationResult = results.map(result => result.params);
          request.payloadValidationResult = results.map(result => result.payload);
        } else {
          request.paramValidationResult = results.params;
          request.payloadValidationResult = results.payload;
        }
        reply.continue();
      })
      .catch((error) => {
        errorResponse.formatError(error, null, reply);
      });
  });

  next();
};

exports.register.attributes = {
  name: 'validate-params'
};

/**
 * Calls validate method for validations
 * @param {Object} validateOptions - the config to validate
 * @param {Object} data - Param and payload values from request
 * @param {Boolean} isNested - If this validation call is nested
 * @param {Validator} validator - Param validator instance
 * @param {Object} data.params - Param values from request
 * @param {Object} [data.payload] - Param values from request
 * @returns {Promise<.Object>} validation result
 */
function appendValidation(validateOptions, data, isNested = false, validator = new Validator(relations)) {
  const parent = validateOptions.parent
    ? [].concat(validateOptions.parent)
    : [];
  const sibling = validateOptions.sibling;
  const ancestor = validateOptions.ancestor;
  const params = data.params;
  const rootNodeOptions = isNested
    ? {
      relationName: validateOptions.relationName,
      primaryKeyValue: _.get(data, validateOptions.primaryKeyPath, params[validateOptions.primaryKey])
    }
    : undefined;

  //Handel all the child validation call at first
  if (parent.length) {
    parent.forEach((parent) => {
      appendValidation(parent, data, true, validator);
    });
  }

  if (sibling) {
    appendValidation(sibling, data, true, validator);
  }

  if (ancestor) {
    ancestor.forEach((ancestor) => {
      appendValidation(ancestor, data, true, validator);
    });
  }


  //Once the child validation call is completed,
  //Append the validation conditions
  if (parent.length) {
    for (let parentOption of parent) {
      validator = validator.withParent({
        rootNode: rootNodeOptions,
        relationName: parentOption.relationName,
        primaryKeyValue: _.get(data, parentOption.primaryKeyPath, params[parentOption.primaryKey])
      });
    }
  }

  if (sibling) {
    //process for sibling
    validator = validator.withSibling({
      rootNode: rootNodeOptions,
      relationName: sibling.relationName,
      primaryKeyValue: _.get(data, sibling.primaryKeyPath, params[sibling.primaryKey]),
      parentRelationName: sibling.parentRelationName
    });
  }
  if (ancestor) {
    //process for ancestor
    const ancestorArray = ancestor.map(function (ancestorObj) {
      const obj = {
        rootNode: rootNodeOptions,
        relationName: ancestorObj.relationName,
        primaryKeyValue: _.get(data, ancestorObj.primaryKeyPath, params[ancestorObj.primaryKey])
      };

      return obj;
    });

    validator = validator.withAncestor(ancestorArray);
  }

  return validator;
}

/**
 * Complete validaiton procedure and run the query on DB
 * @param {Validator} validator - Validator object with the rules attached
 * @param {Object} validateOptions - Validation options from route plugin
 * @param {Object} requestData - User request data
 * @returns {Promise} - Resolves with validation result
 */
function completeValidation(validator, validateOptions, requestData) {
  const primaryKeyValue = _.get(requestData, validateOptions.primaryKeyPath, requestData.params[validateOptions.primaryKey]);


  return validator
    .validate({
      primaryKeyValue,
      relationName: validateOptions.relationName,
    })
    .then(validationResult => {
      return classifyValidationResult(validateOptions, validationResult);
    });
}

/**
 * Classify the validation result based on the validation path
 * @param {Object} validationOptions - The provided validation configuration from route
 * @param {Object} validationResult - The result from validator
 * @returns {Object} - Formatted validation result
 */
function classifyValidationResult(validationOptions, validationResult) {
  const formattedResult = {};

  //Put all the data from validation in the right path
  traverseValidationOption(validationOptions, (dataLocation, relationName) => {
    _.set(formattedResult, `${dataLocation}.${relationName}`, validationResult[relationName]);
  });

  return formattedResult;
}

/**
 * Recursively traverse all the validation options and call an action on each of them
 * @param {Object} validationOptions - The provided validation configuration from route
 * @param {Function} action - Action to be called upon each validation option
 */
function traverseValidationOption(validationOptions, action) {
  //If the validation option is an actual relation
  //Call the action upon it
  if (validationOptions.relationName) {
    //Default validation data location is param
    let dataLocation = 'params';
    const primaryKeyPath = validationOptions.primaryKeyPath;

    //If primary key is manually set the first dot separated string should be the location
    if (primaryKeyPath) {
      const dataLocationPattern = /(.+?)\..+/;

      //Should pick payload.object from payload.object.sid
      dataLocation = dataLocationPattern.exec(primaryKeyPath)[1];
    }

    action(dataLocation, validationOptions.relationName);
  }


  _.forEach(validationOptions, (validationOption) => {
    if (typeof validationOption === 'object') {
      traverseValidationOption(validationOption, action);
    }
  });
}
