'use strict';

const Validator = require('./Validator');
const relations = require('./relations');

const validationService = {
  /**
   * Validate with parent
   * @param {Object} options - Validation options
   * @param {string} relationName - Name of the relation
   * @param {string} primaryKeyValue - Primary key value
   * @returns {Object<Validator>} - A validator type object
   */
  validate(options) {
    const validator = new Validator(relations);
    return validator.validate(options);
  },

  /**
   * Validate with parent
   * @param {Object} options - Validation options
   * @param {string} relationName - Name of the parent relation
   * @param {string} primaryKeyValue - Primary key value of the parent relation
   * @returns {Object<Validator>} - A validator type object
   */
  withParent(options) {
    const validator = new Validator(relations);
    return validator.withParent(options);
  },

  /**
   * Validate with parent
   * @param {Object} options - Validation options
   * @param {string} relationName - Name of the sibling relation
   * @param {string} primaryKeyValue - Primary key value of the sibling relation
   * @returns {Object<Validator>} - A validator type object
   */
  withSibling(options) {
    const validator = new Validator(relations);
    return validator.withSibling(options);
  },

  /**
   * Validate with parent
   * @param {Object} options - Validation options
   * @param {string} relationName - Name of the sibling relation
   * @param {string} primaryKeyValue - Primary key value of the sibling relation
   * @returns {Object<Validator>} - A validator type object
   */
  withAncestor(options) {
    const validator = new Validator(relations);
    return validator.withAncestor(options);
  }
};

module.exports = validationService;
