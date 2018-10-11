'use strict';

const joi = require('joi');
const utils = require('./../../../lib/helpers/utils');

const schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid')
      }),
    payload: joi.object({
      seatSid: joi
        .string()
        .regex(/^SE[a-f0-9]{32}$/, 'SeatSid')
        .optional()
        .description('Seat Sid'),
      calendarSid: joi
        .string()
        .regex(/^CL[a-f0-9]{32}$/, 'Calendar Sid')
        .required()
        .description('Calendar Sid'),
      startDateTime: joi
        .string()
        .isoDate()
        .regex(/.*Z/, 'ISO time format in utc zone')
        .example(utils.dateTemplate(), 'date template')
        .required()
        .description('Start Date'),
      duration: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Duration of Exam'),
      externalId: joi
        .string()
        .allow(null, '')
        .max(255)
        .empty('')
        .default(null)
        .description('External ID'),
      externalSystem: joi
        .string()
        .allow(null, '')
        .max(255)
        .empty('')
        .default(null)
        .description('External System'),
      firstName: joi
        .string()
        .required()
        .description('The first name of the person making the reservation'),
      lastName: joi
        .string()
        .required()
        .description('The last name of the person making the reservation'),
      email: joi
        .string()
        .email()
        .required()
        .description('Email'),
      phone: joi
        .string()
        .allow(null, '')
        .empty('')
        .default(null)
        .description('Phone'),
      notes: joi
        .string()
        .allow(null, '')
        .empty('')
        .default(null)
        .description('Notes'),
      metadata: joi
        .object()
        .raw()
        .allow(null, '')
        .empty('')
        .default(null)
        .options({
          allowUnknown: true,
          stripUnknown: false,
          language: {
            object: {
              base: '!!metadata must be an valid json string' //Throw custom error
            }
          }
        })
        .description('Metadata')
    })
      .required()
      .description('Appointment payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        appointmentSid: joi
          .string()
          .regex(/^SP[a-f0-9]{32}$/, 'Appointment Sid')
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
        .description('Calendar R Sid'),
      startDate: joi
        .date()
        .required()
        .description('Start Date'),
      endDate: joi
        .date()
        .required()
        .description('End Date'),
      externalId: joi
        .string()
        .allow(null)
        .description('External ID'),
      externalSystem: joi
        .string()
        .allow(null)
        .description('External System'),
      firstName: joi
        .string()
        .required()
        .description('First Name'),
      lastName: joi
        .string()
        .required()
        .description('Last Name'),
      email: joi
        .string()
        .required()
        .description('Email'),
      phone: joi
        .string()
        .allow(null)
        .description('Phone'),
      notes: joi
        .string()
        .allow(null)
        .description('Notes'),
      metadata: joi
        .string()
        .allow(null)
        .description('Metadata'),
      internalNotes: joi
        .string()
        .allow(null)
        .description('Internal Notes')
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
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid')
      }),
    query: joi
      .object({
        startDate: joi
          .date()
          .format('YYYY-MM-DD')
          .required()
          .description('Start Date'),
        endDate: joi
          .date()
          .format('YYYY-MM-DD')
          .min(joi.ref('startDate'))
          .required()
          .description('End Date'),
        calendarSid: joi
          .string()
          .regex(/^CL[a-f0-9]{32}$/, 'calendarSid')
          .description('Identifier of Calendar'),
        locationSid: joi
          .string()
          .regex(/^(SL)|(PL)[a-f0-9]{32}$/, 'locationSid')
          .description('Identifier of Calendar')
      })
      .raw()
  },
  patch: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        appointmentSid: joi
          .string()
          .regex(/^SP[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Appointment Sid')
      }),
    payload: joi.object({
      startDateTime: joi
        .string()
        .isoDate()
        .regex(/.*Z/, 'ISO time format in utc zone')
        .example(utils.dateTemplate(), 'date template')
        .description('Start Date Time'),
      duration: joi
        .number()
        .integer()
        .positive()
        .description('Duration of Exam'),
      externalId: joi
        .string()
        .allow(null, '')
        .max(255)
        .empty('')
        .description('External ID'),
      externalSystem: joi
        .string()
        .allow(null, '')
        .max(255)
        .empty('')
        .description('External System'),
      firstName: joi
        .string()
        .description('First Name'),
      lastName: joi
        .string()
        .description('Last Name'),
      email: joi
        .string()
        .email()
        .description('Email'),
      phone: joi
        .string()
        .allow(null, '')
        .empty('')
        .description('Phone'),
      notes: joi
        .string()
        .allow(null, '')
        .description('Notes'),
      metadata: joi
        .object()
        .raw()
        .empty('')
        .options({
          allowUnknown: true,
          stripUnknown: false,
          language: {
            object: {
              base: '!!metadata must be an valid json string' //Throw custom error
            }
          }
        })
        .description('Metadata'),
      internalNotes: joi
        .string()
        .allow(null, '')
        .empty('')
        .description('Internal Notes'),
      status: joi
        .string()
        .valid('scheduled', 'cancelled')
        .description('Status'),
      statusMemo: joi
        .string()
        .allow(null, '')
        .empty('')
        .max(255)
        .description('Status Memo')

    })
      .and('startDateTime', 'duration')
      .required()
      .description('Patch Schema Payload')
  }
};

module.exports = schema;
