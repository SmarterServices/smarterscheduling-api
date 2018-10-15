'use strict';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelizeHelper = {
  /**
   * Builds where query to fit sequelize spec
   * @param {Array} filters - query options
   * @param {Object} data - Data to build the query with
   * @param {Object} [rootQuery] - Optional root query
   * @returns {Object} - An object that will fit into the sequelize where
   */
  buildQuery(filters, data, rootQuery = {}) {
    filters.forEach(option => {
      //If the option is a string then build a query and append in root query
      if (typeof option === 'string') {
        const conditionParts = getConditionPart(option, data);
        appendCondition(conditionParts, rootQuery);

        //If the option is an array
        //Then there is multiple possible value
      } else if (Array.isArray(option)) {
        const key = option[0];

        //Only append condition for the first matching query
        option.some(path => {
          const conditionParts = getConditionPart(path, data, key);
          return appendCondition(conditionParts, rootQuery);
        });

        //Finally if the type is object then it should contain at least one of 'or' or 'and' query
      } else if (typeof option === 'object') {
        //Append or query in the root query
        if (option.or) {
          rootQuery[Op.or] = {};
          this.buildQuery(option.or, data, rootQuery[Op.or]);
        }

        //Append 'and' query in the root query
        if (option.and) {
          rootQuery[Op.and] = {};
          this.buildQuery(option.and, data, rootQuery[Op.and]);
        }
      }
    });

    return rootQuery;
  }
};

module.exports = sequelizeHelper;


/**
 * Append condition to the root query
 * @param {Object} conditionParts - Parts of the condition
 * @param {Object} root - Reference to the root query
 * @returns {boolean} - If the query is appended
 */
function appendCondition(conditionParts, root) {
  if (conditionParts) {
    root[conditionParts.key] = conditionParts.value;
    return true;
  }

  return false;
}

/**
 * Get condition part form path
 * @param {string} path - Path to the value
 * @param {Object} data - Data to query against
 * @param {string} [key] - Optional key to use for the query option
 * @returns {Object} - Key and value for query
 */
function getConditionPart(path, data, key) {
  let value = data;
  const pathParts = path.split('.');
  key = key || pathParts[pathParts.length - 1];

  for (const part of pathParts) {
    if (value.hasOwnProperty(part)) {
      value = value[part];
    } else {
      return false;
    }
  }

  return {key, value};
}


