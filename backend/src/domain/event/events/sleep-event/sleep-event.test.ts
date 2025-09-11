import { SleepEvent } from '@src/domain/event/events/sleep-event/sleep-event.js';
import { MOCKED_MAIN_SLEEP } from '@src/utils/test-utils/defaults.js';
import { parseTime } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('SleepEvent', () => {
  it('sleep event end type shall format correctly', () => {
    const event = new SleepEvent({
      time: parseTime('06:00'),
      description: 'test',
      period: MOCKED_MAIN_SLEEP,
      sleepState: 'end'
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Sleep] (test): Duration 15:30:00, Score (100)"`);
  });

  it('sleep event start type shall format correctly', () => {
    const event = new SleepEvent({
      time: parseTime('06:00'),
      description: 'test',
      period: MOCKED_MAIN_SLEEP,
      sleepState: 'start'
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Sleep] (test): Duration 15:30:00"`);
  });
});
