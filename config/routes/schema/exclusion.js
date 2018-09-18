'use strict';
const joi = require('joi');

const schema = {
  add: {
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
      schedulingAccount: joi
        .string()
        .required()
        .description('Scheduling Account'),
      schedulingAccountRSid: joi
        .any()
        .required()
        .description('Scheduling Account R Sid'),
      schedulingLocation: joi
        .string()
        .allow(null)
        .description('Scheduling Location'),
      schedulingLocationRSid: joi
        .any()
        .required()
        .description('Scheduling Location R Sid'),
      schedule: joi
        .string()
        .allow(null)
        .description('Schedule'),
      scheduleRSid: joi
        .any()
        .required()
        .description('Schedule R Sid'),
      title: joi
        .string()
        .required()
        .description('Title'),
      startDate: joi
        .date()
        .required()
        .description('Start Date'),
      endDate: joi
        .date()
        .allow(null)
        .description('End Date'),
      startTime: joi
        .any()
        .required()
        .description('Start Time'),
      endTime: joi
        .any()
        .required()
        .description('End Time'),
      dayOfWeek: joi
        .number()
        .required()
        .description('Day Of Week'),
      recurring: joi
        .string()
        .required()
        .description('Recurring'),
      externalSystem: joi
        .string()
        .allow(null)
        .description('External System'),
      externalId: joi
        .string()
        .allow(null)
        .description('External ID')
    })
      .required()
      .description('Exclusion payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        exclusionSid: joi
          .string()
          .required()
          .description('Exclusion Sid')
      })
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        exclusionSid: joi
          .string()
          .required()
          .description('Exclusion Sid')
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
      schedulingLocation: joi
        .string()
        .allow(null)
        .description('Scheduling Location'),
      schedulingLocationRSid: joi
        .any()
        .required()
        .description('Scheduling Location R Sid'),
      schedule: joi
        .string()
        .allow(null)
        .description('Schedule'),
      scheduleRSid: joi
        .any()
        .required()
        .description('Schedule R Sid'),
      title: joi
        .string()
        .required()
        .description('Title'),
      startDate: joi
        .date()
        .required()
        .description('Start Date'),
      endDate: joi
        .date()
        .allow(null)
        .description('End Date'),
      startTime: joi
        .any()
        .required()
        .description('Start Time'),
      endTime: joi
        .any()
        .required()
        .description('End Time'),
      dayOfWeek: joi
        .number()
        .required()
        .description('Day Of Week'),
      recurring: joi
        .string()
        .required()
        .description('Recurring'),
      externalSystem: joi
        .string()
        .allow(null)
        .description('External System'),
      externalId: joi
        .string()
        .allow(null)
        .description('External ID')
    })
      .required()
      .description('Exclusion payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        exclusionSid: joi
          .string()
          .required()
          .description('Exclusion Sid')
      })
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')
      }),
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
        .items(joi.string())
        .single()
        .default([])
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .valid('ASC', 'DESC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
