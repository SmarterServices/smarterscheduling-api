'use strict';

const joi = require('joi');

const schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid')
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
      seat: joi
        .string()
        .required()
        .description('Seat'),
      seatRSid: joi
        .any()
        .required()
        .description('Seat R Sid'),
      calendar: joi
        .string()
        .required()
        .description('Calendar'),
      calendarRSid: joi
        .any()
        .required()
        .description('Calendar R Sid')
    })
      .required()
      .description('Appointment payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        appointmentSid: joi
          .string()
          .required()
          .description('Appointment Sid')
      })
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        appointmentSid: joi
          .string()
          .required()
          .description('Appointment Sid')
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
      seat: joi
        .string()
        .required()
        .description('Seat'),
      seatRSid: joi
        .any()
        .required()
        .description('Seat R Sid'),
      calendar: joi
        .string()
        .required()
        .description('Calendar'),
      calendarRSid: joi
        .any()
        .required()
        .description('Calendar R Sid')
    })
      .required()
      .description('Appointment payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        appointmentSid: joi
          .string()
          .required()
          .description('Appointment Sid')
      })
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid')
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
