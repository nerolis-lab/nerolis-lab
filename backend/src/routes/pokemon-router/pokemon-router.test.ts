import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { Application } from 'express';
import type { Logger } from 'sleepapi-common';
import { SNEASEL } from 'sleepapi-common';
import request from 'supertest';
import { beforeAll, vi } from 'vitest';

DaoFixture.init();

let app: Application;

describe('GET /pokemon', function () {
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

  it('should respond with 200 and specific body', async function () {
    const apiSafeSneasel = {
      ...SNEASEL,
      skill: {
        ...SNEASEL.skill,
        activations: {
          critChance: {
            unit: 'crit chance',
            amounts: Array.from({ length: SNEASEL.skill.maxLevel }, (_, i) =>
              SNEASEL.skill.activations.critChance.amount({ skillLevel: i + 1 })
            )
          }
        },
        description: SNEASEL.skill.description({ skillLevel: 1 })
      }
    };
    await request(app)
      .get('/api/pokemon/sneasel')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, apiSafeSneasel);
  });

  it('should respond with 500 when pokemon is not found', async function () {
    await request(app).get('/api/pokemon/not-a-pokemon').expect(500, 'Something went wrong');
  });
});
