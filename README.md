# modeljs-api

### Introduction

ModelJS API is a framework that make the ExpressJS developer life easier. When creating API you know 
how hard it was to create each route to each entity and validate them when creating, refine them when
retrieving. Same code repeat every single time and the authentication is a headache. 

But in the ModelJS API, we provide a simple configurable framework. Enable authentication to your server is 
just 5 lines of code in the config object. 

Not like in LoopBackJS, the configuration is simple and easy to understand. The hooks feature make the api more
stronger and customizable as the developer needs. By default this provides token base authentication.

### Features
 1. ExpressJS, MongoDB, mongoose, mongoose-auto-increment, ExpressJS cors.
 2. Token based authentication with jwt token. Admin account can be created with adminKey
 3. Models can be shaped as they way in mongoose schema
 4. user model can be extend and by default username, password, userRole key is there
 5. api path can be configurable.
 6. Hooks is a strong feature. it can be used as middleware when request processing.
 7. if auth enables, in hooks you can read the user and do the needful
 8. Route can be protected by `allowedRoute` and `notAllowedRoutes`
 9. Actions can be protected by the authentication. Public and private routes.
 
10. #### Future goals
 - move to MySQL and other DB as well
 - role based action definitions.
 - inbuilt password reset and email sending
 
### How to integrate to your express server
1. Create basic express app as bellow

```javascript
const express = require('express');
const logger = require('morgan');

const modelJS = require('modlejs-api');

const config = require('./config');
const hooks = require('./hooks');
const app = express();

// additional logs 
app.use(logger('dev'));

// Define the basic json parse middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// initiate ModelJS application
modelJS(app, config, hooks);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next({test: 'Not Found', status: 404});
});

// error handler
app.use((err, req, res) => {
  res.status(err.status || 500).jsonp(err);
});

module.exports = app;
```
 
### Configuration

1. Models Configurations
2. Hooks Configurations

#### 1. Models Configurations Object

Sample configuration object here and each key will be defined later.
```javascript
module.exports = {
  dbName: 'test-db',      // MongoDB collection name
  apiVersion: 'v1',       // version tag of api, (api/v1/...)
  routePrefix: 'api',     // first part of the url (<routePrefix>/<apiVersion/...)
  enableCors: true,       // cors enabled by `cors` plugin for ExpressJS
   auth: {                // auth related configuration
      enable: true,       // is auth enabled
      adminKey: 'shhh',   // secret key when creating admin users 
      shape: {            // extended user model shape. (username, password and userRole is there)
        telephone: {
          type: String,
        }, 
        age: {
          type: Number,
        }
      }
    },
  models: [               // this array contains the data of each entity
    {
      name: 'Author',     // Name of the Entity to show
      path: 'author',     // url shows this eg: /api/v1/auth/
      autoIncrement: {    // if you want to enable autoincrement id (by mongoose-auto-increment)
        enable: true,         // enable
        field: 'id',          // filed name for auto increment id
        startAt: 100,         // starting number
      },
      shape: {            // shape of the model. (this is same as mongoose model)
        name: {
          type: String,
          required: true,
        },
        age: {
          type: Number,
          required: true,
        },
      },
      allowedActions: [CREATE],     // if allowed actions is given only create can do. 
      notAllowedActions: [GET_ALL], // Author model getAll is not allowed
      privateActions: [GET_ALL],    // to access user should be authenticated
      allPrivate: true,             // to ensure all the actions are under authenticated. no need to define private actions 
      createValidator: () => {},    // manual validator function when creating the model
    },
  ],
}
```

#### 2. Hooks Configurations Object

Sample Hooks configuration object is here and each key will be defined later

NOTE: `Every hook is ExpressJS middleware and you should call next() finally to execute further`

```javascript
module.exports = {
   generic: {                       // execute for all requests
     pre: (req, res, next) => {     // execute before the handler. you can use params or req.body here
        // do something
       next();
     },
     post: (req, res, next) => {    // execute after the handler. you can use mjs related object here.
       // do something
       next();
     }
   },
   signUp: (req, res, next) => {    // call before user models is being created (use this for manual validation)
     // do something
     next();
   },
   models: {                        // hooks that are specified on models
     Book: {                        // model name
       generic: {
         pre: (req, res, next) => { // execute before the handler for all the request to this model
           // do something
           next();
         },
         post: (req, res, next) => { // execute after all the handlers for all the requests to this model
            // do something
           next();
         }
       },  
       getAll: {                    // define action specific hooks here
         pre: (req, res, next) => {
           next();
         },
         post: (req, res, next) => {
           next();
         } 
       }
     }
   }
 }
```


