const request = require('supertest');
const createApp = require('./testServer/index');

describe('Post Endpoints', () => {
  it('should positive health endpoint', async (done) => {
    const res = await request(createApp()).get('/api/v1/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('ok');
    expect(res.body.ok).toBeTruthy();
    done();
  })
});

