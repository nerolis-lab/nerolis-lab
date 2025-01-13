import { Profile, printProfilingResults } from '@src/services/profiler/profiler.js';
import type { Logger } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('profiler', () => {
  beforeEach(() => {
    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  it('shall count the iterations correctly', () => {
    vimic(console, 'log', () => undefined);
    class TestClass {
      @Profile
      public someFunction() {
        return 1;
      }
    }

    const testClass = new TestClass();
    for (let i = 0; i < 10; i++) {
      testClass.someFunction();
    }

    printProfilingResults();

    expect(logger.log).toHaveBeenCalledWith(expect.stringMatching(/Calls: 10/));
  });
});
