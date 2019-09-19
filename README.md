#modeljs-api

###Configuration2

1. Models Configurations
2. Hooks Configurations
3. Auth Configurations

#### 1. Models Configurations Object

```javascript
module.exports = {
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
      notAllowedActions: [GET_ALL],
    },
    {
      name: 'Book',
      path: 'book',
      shape: {
        name: {
          type: String,
          required: true,
        },
        author: {
          type: {
            ref: 'Author',
          },
          required: true,
        },
        description: {
          type: String,
          validate: {
            validator: (value) => {
              return value.length > 20;
            },
            message: 'Value is too small',
          },
        },
      },
      notAllowedActions: [CREATE],
    },
    {
      name: 'Order',
      path: 'order',
      shape: {
        name: {
          type: String,
          required: true,
        },
        items: {
          type: {
            ref: 'Book',
          },
          required: true,
        },
      },
    },
  ];
}
```
