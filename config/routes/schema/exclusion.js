'use strict';
const joi = require('joi');
const schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^SA[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid')
      }),
    payload: joi.object({
      locationSid: joi
        .string()
        .regex(/^SL[a-f0-9]{32}$/)
        .allow(null)
        .description('Scheduling Location Sid'),
      scheduleSid: joi
        .string()
        .regex(/^SC[a-f0-9]{32}$/)
        .allow(null)
        .description('Schedule Sid'),
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
        .min(joi.ref('startDate'))
        .allow(null)
        .description('End Date'),
      dayOfWeek: joi
        .number()
        .integer()
        .required()
        .min(0)
        .max(6)
        .description('Day Of Week'),
      startTime: joi
        .date()
        .format('HH:mm')
        .required()
        .description('Start Time'),
      endTime: joi
        .date()
        .format('HH:mm')
        .min(joi.ref('startTime'))
        .required()
        .description('End Time'),
      recurring: joi
        .string()
        .valid('weekly')
        .allow(null)
        .description('Recurring'),
      externalSystem: joi
        .string()
        .max(255)
        .allow(null)
        .description('External System'),
      externalId: joi
        .string()
        .max(255)
        .allow(null)
        .description('External ID')
    })
      .raw()//keeping the startTime and endTime as input format
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
          .regex(/^SA[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),

        exclusionSid: joi
          .string()
          .regex(/^AE[a-f0-9]{32}$/, 'Exclusion Sid')
          .required()
          .description('Exclusion Sid')
      }),
    payload: joi.object({
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
        .min(joi.ref('startDate'))
        .allow(null)
        .description('End Date'),
      dayOfWeek: joi
        .number()
        .integer()
        .required()
        .min(0)
        .max(6)
        .description('Day Of Week'),
      startTime: joi
        .date()
        .format('HH:mm')
        .required()
        .description('Start Time'),
      endTime: joi
        .date()
        .format('HH:mm')
        .min(joi.ref('startTime'))
        .required()
        .description('End Time'),
      recurring: joi
        .string()
        .valid('weekly')
        .allow(null)
        .description('Recurring'),
      externalSystem: joi
        .string()
        .max(255)
        .allow(null)
        .description('External System'),
      externalId: joi
        .string()
        .max(255)
        .allow(null)
        .description('External ID')
    })
      .raw()//keeping the startTime and endTime as input format
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
          .regex(/^SA[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid')
      }),
    query: {
      locationSid: joi
        .string()
        .regex(/^SL[a-f0-9]{32}$/)
        .description('Scheduling Location Sid'),
      scheduleSid: joi
        .string()
        .regex(/^SC[a-f0-9]{32}$/)
        .description('Schedule Sid'),
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
        .valid('ASC', 'DESC')
        .default('ASC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
