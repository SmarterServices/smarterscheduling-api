
'use strict';

const joi = require('joi');

const schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'Location Sid')
          .required()
          .description('Location Sid')}),
    payload:joi.object({
      title: joi
        .string()
        .max(255)
        .required()
        .description('Title'),
      numberOfSeats: joi
        .number()
        .integer()
        .positive()
        .description('Number of seats'),
      interval: joi
        .number()
        .integer()
        .default(10)
        .min(0)
        .max(999)
        .description('Interval'),
      endBuffer: joi
        .number()
        .integer()
        .default(0)
        .min(0)
        .max(999)
        .description('End buffer'),
    })
      .required()
      .description('Calendar payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'Location Sid')
          .required()
          .description('Location Sid'),
        calendarSid: joi
          .string()
          .regex(/^CL[a-f0-9]{32}$/, 'Calendar Sid')
          .required()
          .description('Calendar Sid')})
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'Location Sid')
          .required()
          .description('Location Sid'),
        calendarSid: joi
          .string()
          .regex(/^CL[a-f0-9]{32}$/, 'Calendar Sid')
          .required()
          .description('Calendar Sid')}),
    payload: joi.object({
      title: joi
        .string()
        .max(255)
        .required()
        .description('Title'),
      numberOfSeats: joi
        .number()
        .integer()
        .positive()
        .description('Number of seats'),
      interval: joi
        .number()
        .integer()
        .default(10)
        .min(0)
        .max(999)
        .description('Interval'),
      endBuffer: joi
        .number()
        .integer()
        .default(0)
        .min(0)
        .max(999)
        .description('End buffer')
    })
      .required()
      .description('Calendar payload')
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
          .description('Location Sid'),

        calendarSid: joi
          .string()
          .required()
          .description('Calendar Sid')})
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'Location Sid')
          .required()
          .description('Location Sid')}),
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
        .single()
        .items(joi
          .string()
          .valid('createdDate')
        )
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
