'use strict';
module.exports = {
  'databases': [
    {
      'dialect': 'postgres',
      'host': 'localhost',
      'databaseName': 'postgres',
      'userName': 'postgres',
      'operatorsAliases': false,
      'password': 'testPassword',
      'protocol': 'postgres',
      'schema': null,
      'ssl': true,
      'sortKey': 'sid',
      'namespace': 'smarter-proctoring',
      'pool': {
        'max': 5,
        'min': 0,
        'idle': 10000
      },
      'scriptOrder': {
        'generate.sql': 0,
        'procedures.sql': 1,
        'triggers.sql': 2
      },
      'uri': 'postgres://qbxidkvuxusflg:69268442ba3ebb81150a34d852913a4287dd3dfb1b8e414dc99aa81795f61797@ec2-54-163-234-20.compute-1.amazonaws.com:5432/d239j4srmmpail'
    },
    {
      'dialect': 'postgres',
      'host': 'localhost',
      'databaseName': 'postgres',
      'userName': 'postgres',
      'password': 'testPassword',
      'schema': null,
      'ssl': true,
      'sortKey': 'sid',
      'namespace': 'smarter-proctoring',
      'scriptOrder': {
        'generate.sql': 0,
        'procedures.sql': 1,
        'triggers.sql': 2
      },
      'uri': 'postgres://qbxidkvuxusflg:69268442ba3ebb81150a34d852913a4287dd3dfb1b8e414dc99aa81795f61797@ec2-54-163-234-20.compute-1.amazonaws.com:5432/d239j4srmmpail'
    }
  ],
  'salesforce': {
    'userName': 'jason@smarterservices.com.dev',
    'password': 'passwordtoken',
    'loginUrl': 'https://cs51.salesforce.com'
  },
  'herokuConnect': {
    'host': 'connect-us.heroku.com',
    'connectionId': 'connection-id',
    'authorization': 'Bearer authorization-token',
    'port': 443
  },
  'errorResponse': {
    'url': 'https://www.smarterservices.com/errors/'
  },
  'logger': {
    'targets': [
      {
        'name': 'rollbar',
        'options': {
          'accessToken': '13df2e6ae55340808221be692d62e8ab',
          'autoInstrument': {
            'log': false
          }
        }
      }
    ]
  }
};
