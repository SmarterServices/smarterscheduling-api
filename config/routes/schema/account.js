'use strict';

const joi = require('joi');

const schema = {
  add: {
    payload: joi.object({
      title: joi
        .string()
        .required()
        .description('Title of the account'),
      externalId: joi
        .string()
        .allow(null)
        .max(255)
        .description('External ID')
    })
      .required()
      .description('Account payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')
      })
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')
      }),
    payload: joi.object({
      id: joi
        .string()
        .required()
        .description('Id'),
      isDeleted: joi
        .boolean()
        .required()
        .description('Is Deleted'),
      name: joi
        .string()
        .required()
        .description('Name'),
      createdDate: joi
        .date()
        .required()
        .description('Created Date'),
      lastModifiedDate: joi
        .date()
        .required()
        .description('Last Modified Date'),
      systemModstamp: joi
        .date()
        .required()
        .description('System Modstamp'),
      title: joi
        .string()
        .required()
        .description('Title'),
      externalId: joi
        .string()
        .allow(null)
        .description('External ID')
    })
      .required()
      .description('Account payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')
      })
  },
  list: {
    query: {
      offset: joi
        .number()
        .integer()
        .min(0)
        .description('Offset for the list'),
      limit: joi
        .number()
        .integer()
        .min(0)
        .description('Number of items to return'),
      sortKeys: joi
        .array()
        .items(joi
          .string()
          .valid('createdDate')
        )
        .single()
        .default(['createdDate'])
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .default('ASC')
        .valid('ASC', 'DESC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
