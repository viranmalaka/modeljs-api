const request = require('supertest');
const createApp = require('./../testServer/index');
const { CREATE } = require('../../util/const').ACTIONS;
const teardown = require('../teardown');

const sampleData = {
  names: [
    'Miguelina Pangburn',
    'Krista Zimmerman',
    'Vickie Gertie',
    'Junko Reason',
    'Cyrstal Wommack',
    'Bertha Hartzog',
    'Gertie Wixom',
    'Roselle Rayborn',
    'Darrick Hebert',
    'Gilda Thiessen',
  ],
};

/**
 * before the test: create models with refs
 * get actions
 *  1. normal get, getById, getOne
 *  2. filter by fields,
 *  3. select keys, (1, -1)
 *  4. populates, complexPopulation
 *  5. JSON parse Errors
 *  6. allowed actions
 *  7. hooks
 */
describe('Get Models', () => {
  const app = createApp({
    dbName: 'mjs-test-db',
    models: [
      {
        name: 'Model1',
        path: 'model1',
        shape: {
          name: {
            type: String,
            required: true,
          },
          number: {
            type: Number,
            required: true,
          },
        },
      },
      {
        name: 'Model2',
        path: 'model2',
        shape: {
          fieldRef: {
            type: {
              ref: 'Model1',
            },
          },
          text: {
            type: String,
          },
        },
      },
      {
        name: 'Model3',
        path: 'model3-hook-test',
        shape: {
          fieldNumber: {
            type: Number
          },
          fieldString: {
            type: String
          },
        },
      },
    ],
  }, {
    models: {
      Model3: {
        getAll: {
          pre: (req, res, next) => {
            if(req.body.fieldNumber < 0) {
              return res.jsonp({success: true, result: 'this is from Model3 pre hook', preHook: true});
            }
            next();
          },
          post: (req, res, next) => {
            res.jsonp({success: true, postHook: true, result: 'this is from Model3 post hook', original: res.mjsResult});
          },
        }
      }
    }
  });

  const continueResult = { model1: {}, model2: {} };

  beforeAll(async (done) => {
    for(let i = 0; i < sampleData.names.length; i ++) {
      let res = await request(app)
        .post('/api/v1/model1')
        .send({ name: sampleData.names[i], number: i + 1 });
      continueResult.model1[`obj${i + 1}`] = res.body.result;
      let res2 = await request(app)
        .post('/api/v1/model2')
        .send({fieldRef: res.body.result._id, text: `Inner name is ${sampleData.names[i]}`});
      continueResult.model2[`obj${i + 1}`] = res2.body.result;
    }
    await request(app)
      .post('/api/v1/model3-hook-test')
      .send({fieldNumber: 10, fieldString: 'test'});
    done();
  });

  it('get all object and result should have 10 objects', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toEqual(10);
    done()
  });

  it('get all for filter 1', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('filter', '{"name": "Junko Reason"}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toEqual(1);
    expect(res.body.result[0].name).toEqual(sampleData.names[3]);
    expect(res.body.result[0].number).toEqual(4);
    done()
  });

  it('get all for filter 2', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('filter', '{"name": {"$regex": "Gertie"}}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toEqual(2);
    expect(res.body.result[0].name).toEqual(sampleData.names[2]);
    expect(res.body.result[0].number).toEqual(3);
    done()
  });

  it('get all for filter 3', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('filter', '{"number": {"$gt": "4"}}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toEqual(6);
    expect(res.body.result[0].name).toEqual(sampleData.names[4]);
    expect(res.body.result[0].number).toEqual(5);
    done()
  });

  it('get all for filter 5', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('filter', '{"number": {"$gte": "4"}}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toEqual(7);
    expect(res.body.result[0].name).toEqual(sampleData.names[3]);
    expect(res.body.result[0].number).toEqual(4);
    done()
  });

  it('should results contain name and _id', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('select', 'name');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('name');
    expect(res.body.result[0]).toHaveProperty('_id');
    expect(res.body.result[0]).not.toHaveProperty('number');
    done()
  });

  it('should results contain only name', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('select', 'name -_id');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('name');
    expect(res.body.result[0]).not.toHaveProperty('_id');
    expect(res.body.result[0]).not.toHaveProperty('number');
    done()
  });

  it('should results should not contain _id', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1')
      .set('select', '-_id');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('name');
    expect(res.body.result[0]).not.toHaveProperty('_id');
    expect(res.body.result[0]).toHaveProperty('number');
    done()
  });

  it('result should given without populate', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('populate', '');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('fieldRef');
    expect(res.body.result[0]).toHaveProperty('text');
    expect(res.body.result[0].fieldRef).toEqual(continueResult.model1.obj1._id);
    done()
  });

  it('result should given with populate', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('populate', 'fieldRef');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('fieldRef');
    expect(res.body.result[0]).toHaveProperty('text');
    expect(res.body.result[0].fieldRef).toEqual(continueResult.model1.obj1);
    done()
  });

  it('test complex populate', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('filter', '{"text": {"$regex": "Gertie"}}')
      .set('select', '-_id')
      .set('complexPopulate', '{ "path": "fieldRef", "select": "name" }');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('fieldRef');
    expect(res.body.result[0]).toHaveProperty('text');
    expect(res.body.result[0].fieldRef).toHaveProperty('_id');
    expect(res.body.result[0].fieldRef).toHaveProperty('name');
    expect(res.body.result[0].fieldRef).not.toHaveProperty('number');
    expect(res.body.result[0].fieldRef._id).toEqual(continueResult.model1.obj3._id);
    expect(res.body.result[0].fieldRef.name).toEqual(continueResult.model1.obj3.name);
    done()
  });

  it('test complex populate only populate with condition', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('complexPopulate', '{ "path": "fieldRef", "match" : {"number": {"$lte": "1"}}}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result[0]).toHaveProperty('fieldRef');
    expect(res.body.result[1]).toHaveProperty('fieldRef');
    expect(res.body.result[0].fieldRef).toEqual(continueResult.model1.obj1);
    expect(res.body.result[1].fieldRef).toBeNull();
    done()
  });

  it('should fail because of json parse error for complexFilter', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('complexPopulate', '{ "path": "fieldRe');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('JSON Parse Error SyntaxError: Unexpected end of JSON input');
    done()
  });

  it('should fail because of json parse error for filter', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2')
      .set('filter', '{ "path": "fieldRe');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('JSON Parse Error SyntaxError: Unexpected end of JSON input');
    done()
  });

  it('get by Id test', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/' + continueResult.model1.obj1._id);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result).toEqual(continueResult.model1.obj1);
    done()
  });

  it('get by Id', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/' + continueResult.model1.obj1._id);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result).toEqual(continueResult.model1.obj1);
    done()
  });

  it('get by Id test with populate', async (done) => {
    const res = await request(app)
      .get('/api/v1/model2/' + continueResult.model2.obj2._id)
      .set('populate', 'fieldRef');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result).not.toEqual(continueResult.model2.obj2);
    done()
  });

  it('get by Id test with select', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/' + continueResult.model1.obj1._id)
      .set('select', '-_id');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(res.body.result).toHaveProperty('name');
    expect(res.body.result).not.toHaveProperty('_id');
    expect(res.body.result).toHaveProperty('number');
    done()
  });

  it('get one by filter without filter', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/one');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result).toEqual(continueResult.model1.obj1);
    done()
  });

  it('get One by filter with filter', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/one')
      .set('filter', '{"number": {"$gte": "4"}}');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toBeUndefined();
    expect(res.body.result).not.toEqual(continueResult.model2.obj4);
    done()
  });

  it('get One with select', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/one')
      .set('filter', '{"number": {"$gte": "4"}}')
      .set('select', '-_id');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body.success).toBeTruthy();
    expect(typeof res.body.result).toEqual('object');
    expect(res.body.result.length).toBeUndefined();
    expect(res.body.result).toHaveProperty('name');
    expect(res.body.result).not.toHaveProperty('_id');
    expect(res.body.result).toHaveProperty('number');
    done()
  });

  it('get One failed because JSON parse error', async (done) => {
    const res = await request(app)
      .get('/api/v1/model1/one')
      .set('filter', '{"number": {"$gte": "4')
      .set('select', '-_id');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('error');
    expect(res.body.success).toBeFalsy();
    expect(res.body.error.message).toEqual('JSON Parse Error SyntaxError: Unexpected end of JSON input');
    done()
  });

  it('should return from pre hook for model 3', async (done) => {
    const res = await request(app)
      .get('/api/v1/model3-hook-test')
      .send({ fieldNumber: -10, fieldString: 'test us'});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body).toHaveProperty('preHook');
    expect(res.body.success).toBeTruthy();
    expect(res.body.preHook).toBeTruthy();
    expect(res.body.result).toEqual('this is from Model3 pre hook');
    done();
  });

  it('should not return from pre hook for model 3', async (done) => {
    const res = await request(app)
      .get('/api/v1/model3-hook-test')
      .send({ fieldNumber: 10, fieldString: 'test us'});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('result');
    expect(res.body).toHaveProperty('postHook');
    expect(res.body.success).toBeTruthy();
    expect(res.body.postHook).toBeTruthy();
    expect(res.body.result).toEqual('this is from Model3 post hook');
    done();
  });

});

afterAll((done) => {
  return teardown('mjs-test-db', done);
});
