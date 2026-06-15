process.env.JWT_SECRET = 'test-secret';
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/server');

describe('Tasks endpoints', () => {
  let token;
  let token2;
  let taskId;

  beforeAll(async () => {
    const r1 = await request(app).post('/api/auth/register').send({ email: 'user1@test.com', password: 'pass1234' });
    token = r1.body.token;
    const r2 = await request(app).post('/api/auth/register').send({ email: 'user2@test.com', password: 'pass1234' });
    token2 = r2.body.token;
  });

  const auth = (t) => ({ Authorization: `Bearer ${t}` });

  test('POST /api/tasks — creates task', async () => {
    const res = await request(app).post('/api/tasks').set(auth(token)).send({
      title: 'Buy groceries',
      description: 'Milk and eggs',
      priority: 'high',
      due_date: '2026-07-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Buy groceries');
    expect(res.body.task.status).toBe('todo');
    taskId = res.body.task.id;
  });

  test('POST /api/tasks — requires title', async () => {
    const res = await request(app).post('/api/tasks').set(auth(token)).send({ description: 'no title' });
    expect(res.status).toBe(400);
  });

  test('GET /api/tasks — lists only own tasks', async () => {
    const res = await request(app).get('/api/tasks').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.tasks.every((t) => t.owner_id !== undefined)).toBe(true);
  });

  test('GET /api/tasks — user2 sees empty list', async () => {
    const res = await request(app).get('/api/tasks').set(auth(token2));
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(0);
  });

  test('GET /api/tasks — search by title', async () => {
    const res = await request(app).get('/api/tasks?search=groceries').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  test('GET /api/tasks — filter by status', async () => {
    const res = await request(app).get('/api/tasks?status=todo').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks.every((t) => t.status === 'todo')).toBe(true);
  });

  test('GET /api/tasks/:id — returns task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe(taskId);
  });

  test('GET /api/tasks/:id — user2 cannot access user1 task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set(auth(token2));
    expect(res.status).toBe(404);
  });

  test('PUT /api/tasks/:id — updates task', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`).set(auth(token)).send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('in_progress');
  });

  test('PUT /api/tasks/:id — user2 cannot update user1 task', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`).set(auth(token2)).send({ status: 'done' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/tasks/:id — deletes task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set(auth(token));
    expect(res.status).toBe(204);
  });

  test('DELETE /api/tasks/:id — 404 on deleted task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set(auth(token));
    expect(res.status).toBe(404);
  });

  test('All endpoints require auth', async () => {
    const endpoints = [
      ['get', '/api/tasks'],
      ['post', '/api/tasks'],
      ['get', `/api/tasks/1`],
      ['put', `/api/tasks/1`],
      ['delete', `/api/tasks/1`],
    ];
    for (const [method, url] of endpoints) {
      const res = await request(app)[method](url);
      expect(res.status).toBe(401);
    }
  });
});
