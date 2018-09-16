'use strict';

const _ = require('lodash');
const herokuData = require('../../middleware/db-connection');
const Sequelize = require('sequelize');
const object2Dot = require('object2dot');
const DEFAULT_PRIMARY_KEY = 'sid';

/**
 * The options for validation
 * @typedef {Object} ValidationOptions
 * @property {string} relationName - Name of the sibling relation
 * @property {string} primaryKeyValue - Primary key value of the sibling relation
 */

/**
 * The validation sequence
 * @typedef {Object} ValidationSequence
 * @property {ValidationOptions|ValidationOptions[]} options - The validation options
 * @property {string} type - The type of validation
 */

/**
 * Class to handle validation between to database relations
 * @class Validator
 */
class Validator {
  /**
   * Create BVirtual client
   * @param {Object} relations - Relations needed for validation
   */
  constructor(relations) {
    this.relations = relations;
    this.selects = [];
    this.validationSequence = [];
    this.joinQueries = [];
    this.joinedTables = [];
  }

  /**
   * Validate a parameter
   * @param {ValidationOptions} options - Validation options of primary relation
   * @returns {Promise} - Validates from given options calling herokuData
   */
  validate(options) {
    this.primaryModelOptions = options;
    const primaryRelationName = options.relationName;
    const primaryRelation = this._findRelation(primaryRelationName);

    this._makeAndPushQuery(options);

    //join all query to build a single query
    const selectFieldsString = this.selects.join(', ');

    const joinQueryString = this.joinQueries.join('\n');

    // Initialize the query with select from a dummy table so that all relations are
    // joined with a left join
    const query = `
      SELECT ${selectFieldsString}
      FROM (SELECT 1) AS "dummy"
      ${joinQueryString}
    `;

    const queryOptions = {type: Sequelize.QueryTypes.SELECT};

    return herokuData.runQuery(query, queryOptions)
      .then(([data]) => {
        const validObjectKeys = [primaryRelationName];

        //save all relationName to check returned data for later
        this.validationSequence.forEach(sequence => {
          if (sequence.type === 'ancestor') {
            sequence.options.forEach(option => validObjectKeys.push(option.relationName));
          } else {
            validObjectKeys.push(sequence.options.relationName);
          }
        });

        const formattedData = object2Dot.rebuild(data);
        //search for error and generate error
        const error = this._handleError(formattedData, primaryRelationName);
        if (error) {
          return Promise.reject(error);
        }

        //check that there is value for each key/ relation
        for (const key of validObjectKeys) {
          if (!_.get(formattedData, key)) {
            return Promise.reject(primaryRelation.error || 'VALIDATION_ERROR');
          }
        }
        return Promise.resolve(formattedData);
      })
      .catch(error => Promise.reject(error));
  }

  /**
   * Validate with ancestor
   * @param {Array<ValidationOptions>} options - Array consisting of validation options for ancestors,
   * ordered from nearest ancestor
   * @returns {Object<Validator>} - Returns self instance to allow method chaining
   * @memberof Validator
   */
  withAncestor(options) {
    options.forEach(option => this._makeAndPushQuery(option));

    this.validationSequence.push({options, type: 'ancestor'});
    return this;
  }


  /**
   * Validate with parent
   * @param {ValidationOptions} options - Validation options for parent
   * @returns {Object<Validator>} - Returns self instance to allow method chaining
   * @memberof Validator
   */
  withParent(options) {
    //push 'select' and 'join' query in an array for later use
    this._makeAndPushQuery(options);

    //save options
    this.validationSequence.push({options, type: 'parent'});
    return this;
  }

  /**
   * Validate with parent
   * @param {ValidationOptions} options - Validation options for sibling
   * @returns {Object<Validator>} - Returns self instance to allow method chaining
   * @memberof Validator
   */
  withSibling(options) {

    //push 'select' and 'join' query in an array for later use
    this._makeAndPushQuery(options);

    //save options
    this.validationSequence.push({options, type: 'sibling'});
    return this;
  }

  /**
   * Get the select query fields for a model
   * @param {Object} model - sequelize model
   * @param {string} relationName - The relation name which will be prepended with the alias
   * @returns {Array<string>} - Query string of selected models
   * @memberof Validator
   */
  _getModelSelects(model, relationName) {
    const attributeNames = Object.keys(model.attributes);
    const modelSelects = attributeNames.map(attributeName => {
      const attributeField = `"${relationName}"."${model.attributes[attributeName].field}"`;
      const alias = `"${relationName}.${attributeName}"`;
      return `${attributeField} AS ${alias}`;
    });

    return modelSelects;
  }

  /**
   * Get the join query for a table
   * @param {Object} options - Options for join query
   * @param {string} options.tableName - Table name of the foreign model
   * @param {string} options.relationName - Relation name of the foreign model
   * @param {string} options.primaryKeyField - Primary key of the foreign model
   * @param {string} options.primaryKeyValue - Primary key value of the foreign model
   * @returns {string} - Join query string
   * @memberof Validator
   */
  _getJoinQuery(options) {
    const {tableName, relationName, primaryKeyField, primaryKeyValue} = options;

    return `LEFT JOIN ${tableName} "${relationName}"
      ON "${relationName}".${primaryKeyField} = '${primaryKeyValue}'`;
  }

  /**
   * Handle validation error
   * @param {Object} formattedData - The data returned from DB after formatting
   * @param {string} primaryRelationName - Name of the primary relation
   * @returns {undefined|Object<Error>} - Return required error
   * @memberof Validator
   */
  _handleError(formattedData, primaryRelationName) {
    if (!this.validationSequence.length && this._assertNullObject(formattedData[primaryRelationName])) {
      return this._notFoundError(this.primaryModelOptions);
    }

    for (const validation of this.validationSequence) {
      let error;
      switch (validation.type) {
        case 'ancestor':
          error = this._handleErrorWithAncestor(formattedData, validation);
          break;
        case 'parent':
          error = this._handleErrorWithParent(formattedData, validation);
          break;
        case 'sibling':
          error = this._handleErrorWithSibling(formattedData, validation);
          break;
      }
      if (error) {
        return error;
      }
    }
  }

  /**
   * Handle validation error with parent
   * @param {Object} formattedData - The data returned from DB after formatting
   * @param {ValidationSequence} validation - Validation sequence of parent
   * @param {ValidationOptions} primaryModelOptions - Validation options of primary relation
   * @returns {undefined|Object<Error>} - If error occurs, return it, otherwise return undefined
   * @memberof Validator
   */
  _handleErrorWithParent(formattedData, validation, primaryModelOptions = this.primaryModelOptions) {

    primaryModelOptions = _.get(validation, 'options.rootNode', primaryModelOptions);
    const primaryRelationName = primaryModelOptions.relationName;
    const parentRelation = this._findRelation(validation.options.relationName);
    const primaryObject = _.get(formattedData, primaryModelOptions.relationName);
    const parentObject = _.get(formattedData, validation.options.relationName);

    //if parent object or primary object is missing,
    //return error
    if (!parentObject || this._assertNullObject(parentObject)) {
      return this._notFoundError(validation.options);
    } else if (!primaryObject || this._assertNullObject(primaryObject)) {
      return this._notFoundError(primaryModelOptions, validation.options);
    }

    //get parentSid of both table and compare them to check if child is under parent or not
    const primaryModelFK = _.get(
      parentRelation,
      `children.${primaryRelationName}.foreignKey`,
      parentRelation.foreignKey
    );
    const parentModelPK = parentRelation.primaryKey || DEFAULT_PRIMARY_KEY;
    const primaryModelFKValue = primaryObject[primaryModelFK];
    const parentModelPKValue = parentObject[parentModelPK];

    if (primaryModelFKValue !== parentModelPKValue) {
      return this._notFoundError(primaryModelOptions, validation.options);
    }
  }

  /**
   * Handle validation error with sibling
   * @param {Object} formattedData - The data returned from DB after formatting
   * @param {ValidationSequence} validation - Validation sequence of sibling
   * @returns {undefined|Object<Error>} - If error occurs, return it, otherwise return undefined
   * @memberof Validator
   */
  _handleErrorWithSibling(formattedData, validation) {
    const parentRelation = this._findRelation(validation.options.parentRelationName);
    const primaryRelation = _.get(validation, 'options.rootNode', this.primaryModelOptions);
    const primaryObject = _.get(formattedData, primaryRelation.relationName);
    const siblingObject = _.get(formattedData, validation.options.relationName);

    //if sibling object or primary object is missing,
    //return error
    if (!siblingObject || this._assertNullObject(siblingObject)) {
      return this._notFoundError(validation.options);
    } else if (!primaryObject || this._assertNullObject(primaryObject)) {
      return this._notFoundError(primaryRelation, validation.options);
    }


    //get parentSid of both table and compare them to check if both sibling has same parent or not
    const parentModelFK = parentRelation.foreignKey;

    const primaryModelFKValue = primaryObject[parentModelFK];
    const siblingModelFKValue = siblingObject[parentModelFK];

    if (primaryModelFKValue !== siblingModelFKValue) {
      return this._notFoundError(primaryRelation, validation.options);
    }
  }

  /**
   * Handle error with ancestor
   * @param {Object} formattedData - Required formatted data
   * @param {ValidationSequence} validation - Validation sequence of ancestor
   * @returns {undefined|Object<Error>} - If error occurs, return it, otherwise return undefined
   * @memberof Validator
   */
  _handleErrorWithAncestor(formattedData, validation) {
    for (let index = validation.options.length - 1; index >= 0; index--) {
      const validationOption = validation.options[index];
      const childModelOptions = index === 0
        ? this.primaryModelOptions
        : validation.options[index - 1];

      const error = this._handleErrorWithParent(formattedData, {options: validationOption}, childModelOptions);

      if (error) {
        return error;
      }
    }
  }

  /**
   * Build not found error
   * @param {ValidationOptions} primaryRelationOptions - Validation options of primary relation
   * @param {ValidationOptions} [secondaryRelationOptions] - Validation options of secondary relation
   * @returns {Object<Error>} - Not found error generated from primary and secondary relations
   * @memberof Validator
   */
  _notFoundError(primaryRelationOptions, secondaryRelationOptions) {
    const primaryRelationNameUpper = _.snakeCase(primaryRelationOptions.relationName).toUpperCase();
    const primaryRelation = this._findRelation(primaryRelationOptions.relationName);
    let errorName;
    // The replacement string name is kept as the foreign key name in defined errors
    const errorOptions = {values: {[primaryRelation.foreignKey]: primaryRelationOptions.primaryKeyValue}};
    if (secondaryRelationOptions) {
      const secondaryRelation = this._findRelation(secondaryRelationOptions.relationName);
      const secondaryRelationNameUpper = _.snakeCase(secondaryRelationOptions.relationName).toUpperCase();

      errorName = `${primaryRelationNameUpper}_NOT_FOUND_UNDER_${secondaryRelationNameUpper}`;
      // The replacement string name is kept as the foreign key name in defined errors
      errorOptions.values[secondaryRelation.foreignKey] = secondaryRelationOptions.primaryKeyValue;
    } else {
      errorName = `${primaryRelationNameUpper}_NOT_FOUND`;
    }

    return errorResponse.formatError(errorName, errorOptions);

  }

  /**
   * Check if all properties of an object is null
   * @param {Object} obj - The object to assert
   * @returns {boolean} - Assert null object
   * @memberof Validator
   */
  _assertNullObject(obj) {
    const keys = Object.keys(obj);
    const isNull = keys.every(key => obj[key] === null);
    return isNull;
  }

  /**
   * Find relation from relations object
   * @param {string} relationName - Name of the relation
   * @param {Object} [rootObject=this.relations] - The root object from which search will be started
   * @returns {Object} - The relation object
   * @memberof Validator
   */
  _findRelation(relationName, rootObject = this.relations) {
    const rootRelationNames = Object.keys(rootObject);
    if (rootRelationNames.includes(relationName)) {
      return rootObject[relationName];
    } else {
      for (const rootRelationName of rootRelationNames) {
        const relationObject = this._findDescendent(relationName, rootObject[rootRelationName]);
        if (relationObject) {
          return relationObject.relation;
        }
      }
      return null;
    }
  }

  /**
   * Find descendent relation of a parent relation
   * @param {string} relationName - Name of the relation
   * @param {Object} ancestor - The relation object of the ancestor
   * @returns {Object} - The relation object of the descendent
   * @memberof Validator
   */
  _findDescendent(relationName, ancestor) {
    if (!ancestor.children) {
      return null;
    }
    const childNames = Object.keys(ancestor.children);

    if (childNames.includes(relationName)) {
      return ancestor.children[relationName];
    } else {
      for (const childName of childNames) {
        const relationObject = this._findDescendent(relationName, ancestor.children[childName].relation);
        if (relationObject) {
          return relationObject;
        }
      }
      return null;
    }
  }


  /**
   * Make select and join query and push them in array
   * @param {ValidationOptions} options - Validation options
   * @memberof Validator
   */
  _makeAndPushQuery(options) {
    const relation = this._findRelation(options.relationName);

    //get field name from model
    const models = herokuData.getModels();
    const model = models[_.kebabCase(options.relationName)];
    const tableName = `${model.options.schema}."${model.tableName}"`;
    const modelPK = relation.primaryKey || DEFAULT_PRIMARY_KEY;
    const modelPKField = model.attributes[modelPK].field;


    //create left join options
    const joinOptions = {
      relationName: options.relationName,
      tableName: tableName,
      primaryKeyField: modelPKField,
      primaryKeyValue: options.primaryKeyValue
    };

    // Checking if the joining query of this table is done previously
    if (_.indexOf(this.joinedTables, tableName) === -1) {
      const joinQuery = this._getJoinQuery(joinOptions);
      const modelSelects = this._getModelSelects(model, options.relationName);

      this.joinQueries.push(joinQuery);
      this.selects.push(...modelSelects);
      this.joinedTables.push(tableName);
    }
  }
}

module.exports = Validator;
