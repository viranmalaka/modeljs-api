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
 *  1. normal get
 *  2. filter by fields,
 *  3. select keys, (1, -1)
 *  4. populates
 *  5. allowed actions
 *  6. hooks
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
    ],
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
    expect(res.body.result[0].name).toEqual('Junko Reason');
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
    expect(res.body.result[0].name).toEqual('Vickie Gertie');
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
    expect(res.body.result[0].name).toEqual('Cyrstal Wommack');
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
    expect(res.body.result[0].name).toEqual('Junko Reason');
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



});

afterAll((done) => {
  return teardown('mjs-test-db', done);
});
