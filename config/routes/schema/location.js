'use strict';

const joi = require('joi');

let schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'accountSid')
          .required()
          .description('Account Sid')
      }),
    payload: joi.object({
      sid: joi
        .string()
        .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'locationSid')
        .description('Sid of the account'),
      title: joi
        .string()
        .required()
        .description('Title'),
      externalId: joi
        .string()
        .max(255)
        .allow(null)
        .description('External ID'),
      seatManagement: joi
        .string()
        .valid('basic', 'advanced')
        .default('basic')
        .allow(null)
        .description('Seat Management')
    })
      .required()
      .description('Location payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'accountSid')
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'locationSid')
          .required()
          .description('Location Sid')
      })
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid')
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
      schedulingAccount: joi
        .string()
        .required()
        .description('Scheduling Account'),
      schedulingAccountRSid: joi
        .any()
        .required()
        .description('Scheduling Account R Sid'),
      externalId: joi
        .string()
        .allow(null)
        .description('External ID'),
      title: joi
        .string()
        .required()
        .description('Title'),
      seatManagement: joi
        .string()
        .required()
        .description('Seat Management')
    })
      .required()
      .description('Location payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid')
      })
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'accountSid')
          .required()
          .description('Account Sid')
      }),
    query: {
      externalId: joi
        .string()
        .description('External id to filter the data by'),
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
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .valid('ASC', 'DESC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
