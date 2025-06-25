import { app } from '@src/app.js';
import { existsSync, readFileSync } from 'fs';
import type { Logger } from 'sleepapi-common';
import request from 'supertest';
import { vi } from 'vitest';

vi.mock('fs');

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

  it('should respond with 200 and changelog content', async () => {
    const mockChangelogContent = '# Changelog\n\n## [1.0.0] - 2023-01-01\n- Initial release';

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(mockChangelogContent);

    await request(app)
      .get('/api/changelog')
      .set('Accept', 'application/json')
      .expect('Content-Type', /text/)
      .expect(200, mockChangelogContent);
  });

  it('should respond with 500 when changelog file not found', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    await request(app).get('/api/changelog').expect(500);
  });

  it('should respond with 500 when file read fails', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('File read error');
    });

    await request(app).get('/api/changelog').expect(500);
  });
});
