# modeljs-api

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


