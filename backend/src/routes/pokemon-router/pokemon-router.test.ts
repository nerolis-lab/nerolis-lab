import { app } from '@src/app.js';
import type { Logger } from 'sleepapi-common';
import { SNEASEL } from 'sleepapi-common';
import request from 'supertest';
import { vi } from 'vitest';

describe('GET /pokemon', function () {
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
          chance: {
            unit: 'chance',
            amounts: Array.from({ length: SNEASEL.skill.maxLevel }, (_, i) =>
              SNEASEL.skill.activations.chance.amount(i + 1)
            )
          }
        },
        description: SNEASEL.skill.description(1)
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
