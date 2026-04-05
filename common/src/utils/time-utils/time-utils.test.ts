import {
  MAX_SLEEP_SCORE_MINUTES,
  parseTime,
  prettifyTime,
  sleepDurationMinutesBetweenBedAndWake,
  sleepScoreFromBedAndWake,
  sleepScoreFromDurationMinutes
} from './time-utils';

describe('parseTime', () => {
  test('parses basic HH:MM format', () => {
    const result = parseTime('12:30');
    expect(result).toEqual({
      hour: 12,
      minute: 30,
      second: 0
    });
  });

  test('parses early morning time', () => {
    const result = parseTime('07:05');
    expect(result).toEqual({
      hour: 7,
      minute: 5,
      second: 0
    });
  });

  test('parses midnight', () => {
    const result = parseTime('00:00');
    expect(result).toEqual({
      hour: 0,
      minute: 0,
      second: 0
    });
  });

  test('parses late night time', () => {
    const result = parseTime('23:59');
    expect(result).toEqual({
      hour: 23,
      minute: 59,
      second: 0
    });
  });

  test('handles single digit hours and minutes', () => {
    const result = parseTime('1:5');
    expect(result).toEqual({
      hour: 1,
      minute: 5,
      second: 0
    });
  });
});

describe('prettifyTime', () => {
  test('formats midday time correctly', () => {
    const time = { hour: 12, minute: 30, second: 45 };
    const prettyTime = prettifyTime(time);
    expect(prettyTime).toBe('12:30:45');
  });

  test('formats early morning time with leading zeros', () => {
    const time = { hour: 7, minute: 5, second: 9 };
    const prettyTime = prettifyTime(time);
    expect(prettyTime).toBe('07:05:09');
  });

  test('formats late night time correctly', () => {
    const time = { hour: 23, minute: 59, second: 59 };
    const prettyTime = prettifyTime(time);
    expect(prettyTime).toBe('23:59:59');
  });

  test('handles rounding of seconds correctly', () => {
    const time = { hour: 14, minute: 49, second: 59.99 };
    const prettyTime = prettifyTime(time);
    expect(prettyTime).toBe('14:49:60');
  });

  test('handles zero hour correctly', () => {
    const time = { hour: 0, minute: 0, second: 0 };
    const prettyTime = prettifyTime(time);
    expect(prettyTime).toBe('00:00:00');
  });
});

describe('sleepScoreFromDurationMinutes', () => {
  test('unrounded scale matches (minutes / full-score minutes) * 100 before rounding', () => {
    const mins = 7 * 60;
    const sleepDurationFraction = Math.min(1, mins / MAX_SLEEP_SCORE_MINUTES);
    expect(sleepScoreFromDurationMinutes(mins)).toBe(Math.min(100, Math.round(sleepDurationFraction * 100)));
  });

  test('matches app scaling for sample durations', () => {
    expect(sleepScoreFromDurationMinutes(8 * 60)).toBe(94);
    expect(sleepScoreFromDurationMinutes(4 * 60 + 15)).toBe(50);
    expect(sleepScoreFromDurationMinutes(8 * 60 + 30)).toBe(100);
    expect(sleepScoreFromDurationMinutes(0)).toBe(0);
    expect(sleepScoreFromDurationMinutes(12 * 60)).toBe(100);
    expect(sleepScoreFromDurationMinutes(60 + 15)).toBe(15);
  });

  test('treats NaN and negative input as zero', () => {
    expect(sleepScoreFromDurationMinutes(Number.NaN)).toBe(0);
    expect(sleepScoreFromDurationMinutes(-10)).toBe(0);
  });
});

describe('sleepDurationMinutesBetweenBedAndWake', () => {
  test('computes same-day duration', () => {
    expect(sleepDurationMinutesBetweenBedAndWake({ bedtime: '22:00', wakeup: '23:15' })).toBe(75);
  });

  test('wraps past midnight', () => {
    expect(sleepDurationMinutesBetweenBedAndWake({ bedtime: '23:30', wakeup: '00:15' })).toBe(45);
  });
});

describe('sleepScoreFromBedAndWake', () => {
  test('matches bedtime/wakeup cases used in the frontend app', () => {
    expect(sleepScoreFromBedAndWake({ bedtime: '22:00', wakeup: '06:00' })).toBe(94);
    expect(sleepScoreFromBedAndWake({ bedtime: '22:00', wakeup: '02:15' })).toBe(50);
    expect(sleepScoreFromBedAndWake({ bedtime: '22:00', wakeup: '06:30' })).toBe(100);
    expect(sleepScoreFromBedAndWake({ bedtime: '22:00', wakeup: '22:00' })).toBe(0);
    expect(sleepScoreFromBedAndWake({ bedtime: '22:00', wakeup: '10:00' })).toBe(100);
  });
});
