import { parseTime, prettifyTime } from './time-utils';

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
