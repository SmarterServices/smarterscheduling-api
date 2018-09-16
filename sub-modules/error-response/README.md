# Error Response

## Introduction

This module is used to format the error and send user defined error in response.

## Installation

### Requirements

* [node.js v4.3](https://nodejs.org/en/blog/release/v4.3.0/)
* [npm](https://www.npmjs.com/)

### Install Process

* Clone project into your working directory.
* Open a `terminal` in your project `root directory`.
* Run `npm install` to install necessary dependencies.


### Configuration

* In your project directory, under `config/errors` subdirectory, list errors in `defined-erros.json` in following structure
```JSON
{
  "JOI": {
    "ERROR_NAME": {
     "code": "4000",
     "message": "Joi related error message"
    }
  },
  "ERROR_NAME": {
    "code": "6000",
    "message": "The error message to attach"
  }
}
```  
All [joi](https://github.com/hapijs/joi/blob/v9.1.1/API.md) related errors will be listed under `JOI` object and other general errors will be listed as shown in the structure.
* In your project directory, go to `config` subdirectory and modify the following things in configuration file (i.e `default.json`).
  * Set `url` to attach additional url in Response
  * Set `printError` to true if you want to print error from module

 For example, your configuration may look like as follows:
 ```JSON
{
  "errorResponse": {
    "url": "https://www.smarterservices.com/errors/",
    "printError": false
  }
}
```

## Running Application/Code

* require module from anywhere
* use `formatError` to format the error
```
const errorResponse = require('error-response');


const options = {
              values: {
                approvalSid: 'AP...',
                installSid: 'AI...'
              }
            };
const error = errorResponse.formatError('APPROVAL_NOT_FOUND_UNDER_INSTALL', options);
``` 

To generate the above error, the error object should be as follows
```JSON
{
  "APPROVAL_NOT_FOUND_UNDER_INSTALL": {
    "code": "6001",
    "message": "approval '%approvalSid%' not found under '%installSid%'",
    "status": 404
  }
}
```

* Here `approvalSid` will be replaced by the given in `options` object.
* Default `statusCode` is 400, passing status in error object will override the default `statusCode`.
* It also expose `errorResponse.failAction` to wrap `joi` related error.

### Running Locally

n/a
### Running in Production
n/a



## External Dependencies

n/a

## Deployment

* n/a

## Cronjobs

* n/a

## Credits

* [Muntasir Ahmed](https://github.com/muntasir-ahmed)
