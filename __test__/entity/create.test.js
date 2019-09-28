const request = require('supertest');
const createApp = require('./../testServer/index');
const { CREATE } = require('../../util/const').ACTIONS;
const teardown = require('../teardown');

/**
 * 1. normal create,
 *      1. fields,
 *      2. auto increments
 *      3. shape
 *        ref, and other types
 *      4. create validation,
 *      5. create per hook
 *      6. create post hook
 *      7. in Allowed list
 *      8. not in allowed list
 *      9. CREATE is not in both
 */
describe('Create Models', () => {
  const app = createApp({
    dbName: 'mjs-test-db',
    models: [
      {
        name: 'Model1',
        path: 'model1-check-fields',
        shape: {
          fieldString: {
            type: String,
            required: true,
          },
          fieldNumber: {
            type: Number,
            required: true,
          },
        },
      },
      {
        name: 'Model2',
        path: 'model2-check-fields-ref',
        shape: {
          fieldRef: {
            type: {
              ref:'Model1'
            }
          },
          fieldString: {
            type: String,
            validate: {
              validator: (value) => {
                return value.length > 20;
              },
              message: 'value length error',
            }
          },
        },
      },
      {
        name: 'Model3',
        path: 'model3-auto-increment',
        shape: {
          fieldNumber: {
            type: Number
          },
          fieldString: {
            type: String
          },
        },
        autoIncrement: {
          enable: true,
          field: 'id',
          startAt: 100,
        },
      },
      {
        name: 'Model4',
        path: 'model4-create-validation',
        shape: {
          fieldNumber: {
            type: Number
          },
          fieldString: {
            type: String
          },
        },
        createValidator: (body) => {
          if (body.fieldNumber < 0) {
            return {
              message: 'Number is negative'
            }
          }
          if (body.fieldString.length < 10) {
            return {
              message: 'String is small'
            }
          }
        }
      },
      {
        name: 'Model5',
        path: 'model5-hook-test',
        shape: {
          fieldNumber: {
            type: Number
          },
          fieldString: {
            type: String
          },
        },
      },
      {
        name: 'Model6',
        path: 'model6-allowed-actions',
        shape: {
          fieldNumber: {
            type: Number
          },
        },
        allowedActions: [CREATE]
      },
      {
        name: 'Model7',
        path: 'model7-not-allowed-actions',
        shape: {
          fieldNumber: {
            type: Number
          },
        },
        notAllowedActions: [CREATE]
      }
    ],
  }, {
    models: {
      Model5: {
        create: {
          pre: (req, res, next) => {
            if(req.body.fieldNumber < 0) {
              return res.jsonp({success: true, result: 'this is from Model5 pre hook', preHook: true});
            }
            next();
          },
          post: (req, res, next) => {
            res.jsonp({success: true, postHook: true, result: 'this is from Model5 post hook', original: res.mjsResult});
          },
        }
      }
    }
  });

  const continueResult = {};

  it('should create an object', async (done) => {
    const res = await request(app)
      .post('/api/v1/model1-check-fields')
      .send({ fieldString: 'Test Name', fieldNumber: 20 });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldString).toEqual('Test Name');
    expect(res.body.result.fieldNumber).toEqual(20);
    expect(res.body.result._id).not.toBeNull();
    continueResult.model1_id = res.body.result._id;
    done();
  });

  it('should give an error for invalid field types', async (done) => {
    const res = await request(app)
      .post('/api/v1/model1-check-fields')
      .send({ fieldString: 'Test Name', fieldNumber: 'test' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.errors.fieldNumber.name).toEqual('CastError');
    done();
  });

  it ('should create object with reference', async (done) => {
    const res = await request(app)
      .post('/api/v1/model2-check-fields-ref')
      .send({ fieldRef: continueResult.model1_id, fieldString: 'test me test me test me'});

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldRef).toEqual(continueResult.model1_id);
    expect(res.body.result.fieldString).toEqual('test me test me test me');
    done();
  });

  it ('should not create object because validation failed by mongoose', async (done) => {
    const res = await request(app)
      .post('/api/v1/model2-check-fields-ref')
      .send({ fieldRef: continueResult.model1_id, fieldString: 'test me'});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.errors.fieldString.message).toEqual('value length error');
    expect(res.body.error._message).toEqual('Model2 validation failed');
    done();
  });

  it ('should enable auto increment with given configs', async (done) => {
    const res = await request(app)
      .post('/api/v1/model3-auto-increment')
      .send({ fieldNumber: 200, fieldString: 'test me'});

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldNumber).toEqual(200);
    expect(res.body.result.fieldString).toEqual('test me');
    expect(res.body.result.id).toEqual(100);
    done();
  });

  it ('should work auto increment with given configs', async (done) => {
    const res = await request(app)
      .post('/api/v1/model3-auto-increment')
      .send({ fieldNumber: 201, fieldString: 'test us'});

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldNumber).toEqual(201);
    expect(res.body.result.fieldString).toEqual('test us');
    expect(res.body.result.id).toEqual(101);
    done();
  });

  it('should pass by the create validator', async (done) => {
    const res = await request(app)
      .post('/api/v1/model4-create-validation')
      .send({ fieldNumber: 10, fieldString: 'test us test us test us'});

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldNumber).toEqual(10);
    expect(res.body.result.fieldString).toEqual('test us test us test us');
    done();
  });

  it('should failed by the create validator number', async (done) => {
    const res = await request(app)
      .post('/api/v1/model4-create-validation')
      .send({ fieldNumber: -10, fieldString: 'test us test us test us'});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('Number is negative');
    done();
  });

  it('should failed by the create validator string length', async (done) => {
    const res = await request(app)
      .post('/api/v1/model4-create-validation')
      .send({ fieldNumber: 10, fieldString: 'test us'});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('String is small');
    done();
  });

  it('should return from pre hook for model 5', async (done) => {
    const res = await request(app)
      .post('/api/v1/model5-hook-test')
      .send({ fieldNumber: -10, fieldString: 'test us'});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body).toHaveProperty('preHook');
    expect(res.body.success).toBeTruthy();
    expect(res.body.preHook).toBeTruthy();
    expect(res.body.result).toEqual('this is from Model5 pre hook');
    done();
  });

  it('should not return from pre hook for model 5', async (done) => {
    const res = await request(app)
      .post('/api/v1/model5-hook-test')
      .send({ fieldNumber: 10, fieldString: 'test us'});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body).not.toHaveProperty('preHook');
    expect(res.body).toHaveProperty('postHook');
    expect(res.body.success).toBeTruthy();
    expect(res.body.postHook).toBeTruthy();
    expect(res.body.result).toEqual('this is from Model5 post hook');
    expect(res.body.original.fieldNumber).toEqual(10);
    done();
  });

  it('should works for allowed action create', async (done) => {
    const res = await request(app)
      .post('/api/v1/model6-allowed-actions')
      .send({ fieldNumber: 10});

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result.fieldNumber).toEqual(10);
    done();
  });

  it('should not works for not allowed action create', async (done) => {
    const res = await request(app)
      .post('/api/v1/model7-not-allowed-actions')
      .send({ fieldNumber: 10});

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('not allowed');
    done();
  });
});

afterAll((done) => {
  return teardown('mjs-test-db', done);
});
