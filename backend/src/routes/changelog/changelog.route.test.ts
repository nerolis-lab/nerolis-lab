import { app } from '@src/app.js';
import { type Logger } from 'sleepapi-common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/changelog', () => {
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
