import { prettifyTime } from './time-utils';

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
