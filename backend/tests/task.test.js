const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const Task = require('../src/models/Task');

// my Linux OS was showing a warning about the MongoDB version being used, so I set these env vars to avoid that warning
process.env.MONGOMS_VERSION = '8.0.4';
process.env.MONGOMS_DISTRO = 'debian-12';

let mongoServer;
let server;
let baseUrl;

const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

const VALID_TASK = {
  title: 'Complete pending Assignment',
  description: 'Outline REST APIs for the To-Do List application',
  dueDate: '2030-08-20T18:00:00.000Z',
  priority: 'High',
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  // dropDatabase() also drops indexes — rebuild them so $text search works.
  await Task.syncIndexes();
});

test('POST /api/v1/tasks creates a task and returns 201 with id', async () => {
  const res = await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(VALID_TASK),
  });
  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.message, 'Task created successfully');
  assert.ok(body.data.id);
  assert.strictEqual(body.data.title, VALID_TASK.title);
  assert.strictEqual(body.data.status, 'pending');
  assert.strictEqual(body.data.priority, 'High');
  assert.ok(body.data.createdAt);
});

test('POST rejects missing title with 400', async () => {
  const res = await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ description: 'no title here' }),
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.success, false);
  assert.ok(body.details.length >= 1);
});

test('POST rejects invalid status enum with 400', async () => {
  const res = await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...VALID_TASK, status: 'halfway' }),
  });
  assert.strictEqual(res.status, 400);
});

test('POST rejects past dueDate with 400', async () => {
  const res = await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...VALID_TASK, dueDate: '2020-01-01T00:00:00.000Z' }),
  });
  assert.strictEqual(res.status, 400);
});

test('GET /api/v1/tasks returns list with count', async () => {
  await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) });
  await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...VALID_TASK, title: 'Second task' }),
  });

  const res = await request('/api/v1/tasks');
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.count, 2);
  assert.strictEqual(body.data.length, 2);
  assert.ok(body.data[0].id);
});

test('GET /api/v1/tasks supports status and priority filters', async () => {
  await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) });
  await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...VALID_TASK, title: 'Second task', priority: 'Low' }),
  });

  const res = await request('/api/v1/tasks?status=pending&priority=High');
  const body = await res.json();
  assert.strictEqual(body.count, 1);
  assert.strictEqual(body.data[0].title, VALID_TASK.title);
});

test('GET /api/v1/tasks/search?q= matches title text', async () => {
  await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) });
  await request('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...VALID_TASK, title: 'Buy groceries' }),
  });

  const res = await request('/api/v1/tasks/search?q=Assignment');
  const body = await res.json();
  assert.strictEqual(body.count, 1);
  assert.strictEqual(body.data[0].title, VALID_TASK.title);
});

test('GET /api/v1/tasks/search requires q parameter', async () => {
  const res = await request('/api/v1/tasks/search');
  assert.strictEqual(res.status, 400);
});

test('GET /api/v1/tasks/:id returns a single task', async () => {
  const created = await (
    await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) })
  ).json();

  const res = await request(`/api/v1/tasks/${created.data.id}`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.id, created.data.id);
  assert.strictEqual(body.data.title, VALID_TASK.title);
});

test('GET /api/v1/tasks/:id returns 404 for unknown id', async () => {
  const res = await request(`/api/v1/tasks/${new mongoose.Types.ObjectId()}`);
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.success, false);
});

test('PATCH /api/v1/tasks/:id updates status', async () => {
  const created = await (
    await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) })
  ).json();

  const res = await request(`/api/v1/tasks/${created.data.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'completed' }),
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.status, 'completed');
  assert.strictEqual(body.data.title, VALID_TASK.title); // untouched
});

test('PATCH with invalid status is rejected', async () => {
  const created = await (
    await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) })
  ).json();

  const res = await request(`/api/v1/tasks/${created.data.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'nope' }),
  });
  assert.strictEqual(res.status, 400);
});

test('PUT requires a title (full update)', async () => {
  const created = await (
    await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) })
  ).json();

  const res = await request(`/api/v1/tasks/${created.data.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'completed' }),
  });
  assert.strictEqual(res.status, 400);
});

test('DELETE /api/v1/tasks/:id removes the task', async () => {
  const created = await (
    await request('/api/v1/tasks', { method: 'POST', body: JSON.stringify(VALID_TASK) })
  ).json();

  const res = await request(`/api/v1/tasks/${created.data.id}`, { method: 'DELETE' });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.message, 'Task deleted successfully');

  const after = await request(`/api/v1/tasks/${created.data.id}`);
  assert.strictEqual(after.status, 404);
});

test('DELETE unknown id returns 404', async () => {
  const res = await request(`/api/v1/tasks/${new mongoose.Types.ObjectId()}`, {
    method: 'DELETE',
  });
  assert.strictEqual(res.status, 404);
});

test('Invalid ObjectId format returns 400', async () => {
  const res = await request('/api/v1/tasks/not-an-id');
  assert.strictEqual(res.status, 400);
});

test('Unknown route returns 404 JSON', async () => {
  const res = await request('/api/v1/nope');
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.success, false);
});
