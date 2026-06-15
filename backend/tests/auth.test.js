process.env.JWT_SECRET = 'test-secret';
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/server');

describe('Auth endpoints', () => {
  const user = { email: 'test@example.com', password: 'password123', name: 'Tester' };
  let token;

  test('POST /api/auth/register — creates account', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();
    token = res.body.token;
  });

  test('POST /api/auth/register — duplicate email returns 409', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register — short password returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — returns token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('POST /api/auth/login — returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — returns user with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  test('GET /api/auth/me — returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
