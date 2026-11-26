import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app.js';
import Application from '../models/Application.js';

process.env.NODE_ENV = 'test';
let mongo;
let app;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Application.deleteMany({});
});

const sample = (overrides = {}) => ({
  company: 'Acme Corp',
  jobTitle: 'Frontend Developer',
  status: 'Applied',
  location: 'Chennai',
  salary: '6 LPA',
  applicationDate: '2026-11-01',
  notes: 'Referred by a friend',
  ...overrides,
});

describe('health', () => {
  it('reports database connectivity', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'connected');
  });
});

describe('CRUD', () => {
  it('creates, reads, updates and deletes an application', async () => {
    const created = await request(app).post('/api/applications').send(sample());
    assert.equal(created.status, 201);
    const id = created.body.data._id;
    assert.equal(created.body.data.company, 'Acme Corp');
    assert.equal(new Date(created.body.data.applicationDate).toISOString().slice(0, 10), '2026-11-01');

    const fetched = await request(app).get(`/api/applications/${id}`);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.data.jobTitle, 'Frontend Developer');

    const updated = await request(app)
      .put(`/api/applications/${id}`)
      .send({ status: 'Interview', interviewDate: '2030-01-15T10:30:00.000Z' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, 'Interview');
    assert.equal(updated.body.data.company, 'Acme Corp');

    const cleared = await request(app).put(`/api/applications/${id}`).send({ interviewDate: '' });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.data.interviewDate, null);

    const removed = await request(app).delete(`/api/applications/${id}`);
    assert.equal(removed.status, 200);
    const missing = await request(app).get(`/api/applications/${id}`);
    assert.equal(missing.status, 404);
  });

  it('ignores unknown fields', async () => {
    const res = await request(app).post('/api/applications').send(sample({ isAdmin: true, _id: 'x' }));
    assert.equal(res.status, 201);
    assert.equal(res.body.data.isAdmin, undefined);
  });
});

describe('validation', () => {
  it('requires company and job title', async () => {
    const res = await request(app).post('/api/applications').send({ status: 'Saved' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors.map((e) => e.field).sort(), ['company', 'jobTitle']);
  });

  it('rejects invalid status, date, URL and id', async () => {
    assert.equal((await request(app).post('/api/applications').send(sample({ status: 'Ghosted' }))).status, 400);
    assert.equal((await request(app).post('/api/applications').send(sample({ applicationDate: 'tomorrow' }))).status, 400);
    assert.equal((await request(app).post('/api/applications').send(sample({ jobUrl: 'javascript:alert(1)' }))).status, 400);
    assert.equal((await request(app).get('/api/applications/not-an-id')).status, 400);
    assert.equal((await request(app).put('/api/applications/507f1f77bcf86cd799439011').send({ company: '' })).status, 400);
  });

  it('returns 404 for unknown ids and routes, 400 for bad JSON', async () => {
    assert.equal((await request(app).put('/api/applications/507f1f77bcf86cd799439011').send({ status: 'Offer' })).status, 404);
    assert.equal((await request(app).delete('/api/applications/507f1f77bcf86cd799439011')).status, 404);
    assert.equal((await request(app).get('/api/unknown')).status, 404);
    const bad = await request(app).post('/api/applications').set('Content-Type', 'application/json').send('{bad');
    assert.equal(bad.status, 400);
  });
});

describe('search, filter and stats', () => {
  beforeEach(async () => {
    await Application.create([
      sample({ company: 'Google', jobTitle: 'SWE', status: 'Interview', interviewDate: new Date(Date.now() + 86400000) }),
      sample({ company: 'Zoho', jobTitle: 'React Developer', status: 'Applied' }),
      sample({ company: 'Infosys', jobTitle: 'Analyst', status: 'Rejected' }),
      sample({ company: 'TCS', jobTitle: 'Node.js Developer', status: 'Offer' }),
    ]);
  });

  it('searches company and job title case-insensitively', async () => {
    const byCompany = await request(app).get('/api/applications?search=goo');
    assert.deepEqual(byCompany.body.data.map((a) => a.company), ['Google']);
    const byTitle = await request(app).get('/api/applications?search=developer&sort=company');
    assert.deepEqual(byTitle.body.data.map((a) => a.company), ['TCS', 'Zoho']);
    const special = await request(app).get('/api/applications?search=node.js');
    assert.equal(special.body.count, 1);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/applications?status=Rejected');
    assert.deepEqual(res.body.data.map((a) => a.company), ['Infosys']);
    assert.equal((await request(app).get('/api/applications?status=Nope')).status, 400);
  });

  it('computes statistics from the database', async () => {
    const res = await request(app).get('/api/applications/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 4);
    assert.deepEqual(res.body.data.byStatus, { Saved: 0, Applied: 1, Interview: 1, Offer: 1, Selected: 0, Rejected: 1 });
    assert.equal(res.body.data.upcomingInterviewCount, 1);
    assert.equal(res.body.data.upcomingInterviews[0].company, 'Google');
  });
});

describe('CORS', () => {
  it('allows the configured origin only', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173');
    const blocked = await request(app).get('/api/health').set('Origin', 'http://evil.example');
    assert.equal(blocked.headers['access-control-allow-origin'], undefined);
  });
});
