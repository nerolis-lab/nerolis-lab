import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { Application } from 'express';
import { type Logger } from 'sleepapi-common';
import request from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

DaoFixture.init();

let app: Application;

describe('GET /api/changelog', () => {
  beforeAll(async () => {
    // Import app after DaoFixture.init() has set up the test database
    const { app: testApp } = await import('@src/app.js');
    app = testApp;
  });

  beforeEach(() => {
    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should respond with 200 and return changelog data', async () => {
    const response = await request(app).get('/api/changelog').set('Accept', 'application/json').expect(200);

    const data = JSON.parse(response.text);
    expect(Array.isArray(data)).toBe(true);

    expect(data[0]).toHaveProperty('version');
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('type');
    expect(data[0]).toHaveProperty('features');
    expect(data[0]).toHaveProperty('bugFixes');
    expect(data[0]).toHaveProperty('breakingChanges');
    expect(data[0]).toHaveProperty('otherChanges');
  });
});
