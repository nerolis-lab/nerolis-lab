import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Time, TimePeriod } from 'sleepapi-common';
import { describe, expect, it, test } from 'vitest';

describe('toMinutes', () => {
  it('shall convert Time to minutes', () => {
    expect(TimeUtils.toMinutes({ hour: 8, minute: 30, second: 0 })).toBe(510);
  });
});

describe('TimeUtils.isAfterOrEqualWithinPeriod', () => {
  it('shall return true if event time has passed', () => {
    const currentTime: Time = {
      hour: 12,
      minute: 0,
      second: 0
    };
    const eventTime: Time = {
      hour: 10,
      minute: 0,
      second: 0
    };
    const period: TimePeriod = {
      start: {
        hour: 8,
        minute: 0,
        second: 0
      },
      end: {
        hour: 22,
        minute: 0,
        second: 0
      }
    };

    expect(TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime, period })).toBeTruthy();
  });

  it('shall return true if event time is equal to current time', () => {
    const currentTime: Time = {
      hour: 10,
      minute: 0,
      second: 0
    };
    const eventTime: Time = {
      hour: 10,
      minute: 0,
      second: 0
    };
    const period: TimePeriod = {
      start: {
        hour: 8,
        minute: 0,
        second: 0
      },
      end: {
        hour: 22,
        minute: 0,
        second: 0
      }
    };

    expect(TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime, period })).toBeTruthy();
  });

  it('shall return false if event time is just after midnight and we are still on previous day', () => {
    const currentTime: Time = {
      hour: 12,
      minute: 0,
      second: 0
    };
    const eventTime: Time = {
      hour: 1,
      minute: 0,
      second: 0
    };
    const period: TimePeriod = {
      start: {
        hour: 8,
        minute: 0,
        second: 0
      },
      end: {
        hour: 2,
        minute: 0,
        second: 0
      }
    };

    expect(TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime, period })).toBeFalsy();
  });
});

describe('calculateSleepDuration', () => {
  it('shall calculate sleep duration correctly', () => {
    const bedtime: Time = {
      hour: 21,
      minute: 30,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 6,
      minute: 0,
      second: 1
    };
    const duration = TimeUtils.calculateDuration({ start: bedtime, end: wakeupTime });
    expect(duration).toEqual({ hour: 8, minute: 30, second: 1 });
  });

  it('shall calculate sleep duration correctly if going to bed after midnight', () => {
    const bedtime: Time = {
      hour: 0,
      minute: 30,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };
    const duration = TimeUtils.calculateDuration({ start: bedtime, end: wakeupTime });
    expect(duration).toEqual({ hour: 5, minute: 30, second: 0 });
  });

  it('shall calculate sleep duration correctly if sleeping nearly all day', () => {
    const bedtime: Time = {
      hour: 5,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 4,
      minute: 0,
      second: 0
    };
    const duration = TimeUtils.calculateDuration({ start: bedtime, end: wakeupTime });
    expect(duration).toEqual({ hour: 23, minute: 0, second: 0 });
  });

  it('shall calculate sleep duration correctly for a nap', () => {
    const bedtime: Time = {
      hour: 14,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 16,
      minute: 0,
      second: 0
    };
    const duration = TimeUtils.calculateDuration({ start: bedtime, end: wakeupTime });
    expect(duration).toEqual({ hour: 2, minute: 0, second: 0 });
  });
});

describe('secondsToTime', () => {
  it('shall convert seconds to Time', () => {
    expect(TimeUtils.secondsToTime(3661)).toEqual({ hour: 1, minute: 1, second: 1 });
  });
});

describe('TimeUtils.divideTimePeriod', () => {
  it('shall split a default day into equal periods', () => {
    const period: TimePeriod = {
      start: {
        hour: 6,
        minute: 0,
        second: 0
      },
      end: {
        hour: 21,
        minute: 30,
        second: 0
      }
    };
    expect(TimeUtils.divideTimePeriod(period, 2)).toMatchInlineSnapshot(`
[
  {
    "end": {
      "hour": 13,
      "minute": 45,
      "second": 0,
    },
    "start": {
      "hour": 6,
      "minute": 0,
      "second": 0,
    },
  },
  {
    "end": {
      "hour": 21,
      "minute": 30,
      "second": 0,
    },
    "start": {
      "hour": 13,
      "minute": 45,
      "second": 0,
    },
  },
]
`);
  });

  it('shall split a day ending after midnight into equal periods', () => {
    const period: TimePeriod = {
      start: {
        hour: 12,
        minute: 0,
        second: 0
      },
      end: {
        hour: 2,
        minute: 0,
        second: 0
      }
    };

    expect(TimeUtils.divideTimePeriod(period, 2)).toMatchInlineSnapshot(`
[
  {
    "end": {
      "hour": 19,
      "minute": 0,
      "second": 0,
    },
    "start": {
      "hour": 12,
      "minute": 0,
      "second": 0,
    },
  },
  {
    "end": {
      "hour": 2,
      "minute": 0,
      "second": 0,
    },
    "start": {
      "hour": 19,
      "minute": 0,
      "second": 0,
    },
  },
]
`);
  });
});

describe('timeWithinPeriod', () => {
  it('shall return true if time is equal to end time', () => {
    const time: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };
    const start: Time = {
      hour: 4,
      minute: 0,
      second: 0
    };
    const ifWithin = TimeUtils.timeWithinPeriod(time, { start, end: time });
    expect(ifWithin).toBeTruthy();
  });
});

describe('time period overlap', () => {
  const time = (str: string): Time => TimeUtils.parseTime(str);

  const period = (start: string, end: string): TimePeriod => ({
    start: time(start),
    end: time(end)
  });

  describe('getTimePeriodOverlap', () => {
    const eightToFour = period('08:00', '16:00');

    const nineToFive = period('09:00', '17:00');

    const afterWork = period('17:00', '23:00');

    const justNight = period('23:00', '03:00');

    const nightBeforeToNoon = period('23:00', '12:00');

    const earlyMorning = period('00:00', '06:00');

    const lateNight = period('22:00', '02:00');

    const fullDay = period('00:00', '00:00');

    it('should handle same-day overlap', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(eightToFour, nineToFive);

      expect(overlap).toEqual([period('09:00', '16:00')]);
    });

    it('should handle no overlap', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(eightToFour, afterWork);

      expect(overlap).toEqual([]);
    });

    it('should handle period crossing midnight with overlap after midnight', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(justNight, earlyMorning);

      expect(overlap).toEqual([period('00:00', '03:00')]);
    });

    it('should handle period crossing midnight with overlap before midnight', () => {
      const shortBeforeMidnight = period('21:00', '22:30');

      const overlap = TimeUtils.getTimePeriodOverlap(shortBeforeMidnight, lateNight);
      expect(overlap).toEqual([period('22:00', '22:30')]);
    });

    it('should handle both periods crossing midnight', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(justNight, lateNight);

      expect(overlap).toEqual([period('23:00', '02:00')]);
    });

    it('should handle period spanning most of the day', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(nightBeforeToNoon, eightToFour);

      expect(overlap).toEqual([period('08:00', '12:00')]);
    });

    it('should return same when periods match exactly', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(eightToFour, eightToFour);

      expect(overlap).toEqual([eightToFour]);
    });

    it('should return smaller period when one period completely contains another', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(nightBeforeToNoon, justNight);

      expect(overlap).toEqual([justNight]);
    });

    it('should return null when periods touch but do not overlap', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(nightBeforeToNoon, afterWork);
      expect(overlap).toEqual([]);
    });

    it('should return the full second period when one is a 24-hour period', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(fullDay, eightToFour);
      expect(overlap).toEqual([eightToFour]);
    });

    it('should return full day when both periods are 24 hours', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(fullDay, fullDay);
      expect(overlap).toEqual([fullDay]);
    });

    it('should handle 24-hour period with second period overlapping midnight', () => {
      const overlap = TimeUtils.getTimePeriodOverlap(fullDay, nightBeforeToNoon);

      expect(overlap).toEqual([nightBeforeToNoon]);
    });
  });

  describe('getLatestMinuteInOverlap', () => {
    it('returns the latest full minute from a single overlap segment', () => {
      const result = TimeUtils.getLatestMinuteInOverlap(period('10:00', '12:00'), period('11:00', '13:00'));
      expect(result).toEqual(time('11:59'));
    });

    it('returns the latest full minute from a merged wraparound overlap', () => {
      const result = TimeUtils.getLatestMinuteInOverlap(period('23:00', '03:00'), period('00:00', '02:00'));
      expect(result).toEqual(time('01:59'));
    });

    it('returns undefined when there is no overlap', () => {
      const result = TimeUtils.getLatestMinuteInOverlap(period('08:00', '10:00'), period('12:00', '14:00'));
      expect(result).toBeUndefined();
    });

    it('floors the latest second to the start of the minute', () => {
      const result = TimeUtils.getLatestMinuteInOverlap(period('09:00', '10:00'), period('09:00', '10:00'));
      expect(result).toEqual(time('09:59'));
    });
  });
});

describe('TimeUtils.addTime', () => {
  it('adds times without overflow correctly', () => {
    const time1 = { hour: 10, minute: 20, second: 30 };
    const time2 = { hour: 1, minute: 10, second: 15 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 11, minute: 30, second: 45 });
  });

  it('handles seconds overflow into minutes', () => {
    const time1 = { hour: 14, minute: 59, second: 30 };
    const time2 = { hour: 0, minute: 0, second: 45 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 15, minute: 0, second: 15 });
  });

  it('handles minutes overflow into hours', () => {
    const time1 = { hour: 23, minute: 45, second: 0 };
    const time2 = { hour: 0, minute: 30, second: 0 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 0, minute: 15, second: 0 }); // Note: Overflow beyond 24 hours resets to 0
  });

  it('wraps around at 24 hours correctly', () => {
    const time1 = { hour: 22, minute: 0, second: 0 };
    const time2 = { hour: 3, minute: 0, second: 0 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 1, minute: 0, second: 0 }); // 25 hours total wraps to 1 hour
  });

  it('combines overflow of seconds and minutes', () => {
    const time1 = { hour: 11, minute: 59, second: 55 };
    const time2 = { hour: 0, minute: 0, second: 10 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 12, minute: 0, second: 5 });
  });

  it('exactly wraps around at 24 hours to 0 hours', () => {
    const time1 = { hour: 23, minute: 30, second: 30 };
    const time2 = { hour: 0, minute: 29, second: 30 };
    const result = TimeUtils.addTime(time1, time2);
    expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
  });
});

describe('TimeUtils.sortTimesForPeriod', () => {
  const morningPeriod = { start: { hour: 6, minute: 0, second: 0 }, end: { hour: 12, minute: 0, second: 0 } };

  it('sorts times within period in ascending order', () => {
    const time1 = { hour: 7, minute: 0, second: 0 };
    const time2 = { hour: 9, minute: 0, second: 0 };
    const result = TimeUtils.sortTimesForPeriod(time1, time2, morningPeriod);
    expect(result).toBeLessThan(0);
  });

  it('sorts times outside period in ascending order', () => {
    const time1 = { hour: 13, minute: 0, second: 0 };
    const time2 = { hour: 15, minute: 0, second: 0 };
    const result = TimeUtils.sortTimesForPeriod(time1, time2, morningPeriod);
    expect(result).toBeLessThan(0);
  });

  it('prioritizes time within period over time outside', () => {
    const timeWithin = { hour: 8, minute: 0, second: 0 };
    const timeOutside = { hour: 13, minute: 0, second: 0 };
    const result = TimeUtils.sortTimesForPeriod(timeWithin, timeOutside, morningPeriod);
    expect(result).toBeLessThan(0);
  });

  it('correctly handles equal times', () => {
    const time1 = { hour: 10, minute: 0, second: 0 };
    const time2 = { hour: 10, minute: 0, second: 0 };
    const result = TimeUtils.sortTimesForPeriod(time1, time2, morningPeriod);
    expect(result).toBe(0);
  });
});

describe('scheduleEnergyEvents', () => {
  const dayPeriod = { start: { hour: 8, minute: 0, second: 0 }, end: { hour: 20, minute: 0, second: 0 } }; // 8 AM to 8 PM

  it('sorts events within period in ascending order', () => {
    const recoveries = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Midmorning Recovery', delta: 20 }),
      new EnergyEvent({ time: { hour: 10, minute: 45, second: 0 }, description: 'Late Morning Recovery', delta: 25 })
    ];
    const sortedEvents = TimeUtils.sortEventsForPeriod(dayPeriod, recoveries);
    expect(sortedEvents[0].time.hour).toBeLessThan(sortedEvents[1].time.hour); // First event comes before second
  });

  it('handles mixed events (within and outside period)', () => {
    const recoveries = [
      new EnergyEvent({ time: { hour: 21, minute: 0, second: 0 }, description: 'Post Period Recovery', delta: 15 }),
      new EnergyEvent({ time: { hour: 10, minute: 0, second: 0 }, description: 'Morning Recovery', delta: 20 })
    ];
    const sortedEvents = TimeUtils.sortEventsForPeriod(dayPeriod, recoveries);
    expect(sortedEvents[0].description).toBe('Morning Recovery'); // Event within period comes first
  });

  it('returns an empty array when no events are provided', () => {
    const recoveries: EnergyEvent[] = [];
    const sortedEvents = TimeUtils.sortEventsForPeriod(dayPeriod, recoveries);
    expect(sortedEvents).toEqual([]);
  });
});

describe('TimeUtils.divideTimePeriod', () => {
  it('divides a period into the correct number of chunks', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } }; // 8-hour period
    const chunks = 4;
    const dividedPeriods = TimeUtils.divideTimePeriod(period, chunks);
    expect(dividedPeriods.length).toBe(chunks);
  });

  it('ensures continuity between chunks', () => {
    const period = { start: { hour: 6, minute: 0, second: 0 }, end: { hour: 18, minute: 0, second: 0 } }; // 12-hour period
    const chunks = 3;
    const dividedPeriods = TimeUtils.divideTimePeriod(period, chunks);
    for (let i = 1; i < dividedPeriods.length; i++) {
      expect(dividedPeriods[i].start).toEqual(dividedPeriods[i - 1].end);
    }
  });

  it('handles periods spanning past midnight', () => {
    const period = { start: { hour: 22, minute: 0, second: 0 }, end: { hour: 6, minute: 0, second: 0 } }; // Spanning midnight
    const chunks = 2;
    const dividedPeriods = TimeUtils.divideTimePeriod(period, chunks);
    expect(dividedPeriods.length).toBe(chunks);
  });

  it("adjusts for periods that don't divide evenly", () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 30, second: 0 } }; // 8.5-hour period
    const chunks = 3;
    const dividedPeriods = TimeUtils.divideTimePeriod(period, chunks);

    const totalDuration = 8 * 60 + 30; // 510 minutes for 8.5 hours
    const chunkDuration = Math.floor(totalDuration / chunks);
    const lastChunkExtra = totalDuration % chunks;
    expect(dividedPeriods.length).toBe(chunks);
    const firstChunkDuration =
      dividedPeriods[0].end.hour * 60 +
      dividedPeriods[0].end.minute -
      (dividedPeriods[0].start.hour * 60 + dividedPeriods[0].start.minute);
    expect(firstChunkDuration).toBe(chunkDuration);
    const lastChunkDuration =
      dividedPeriods[chunks - 1].end.hour * 60 +
      dividedPeriods[chunks - 1].end.minute -
      (dividedPeriods[chunks - 1].start.hour * 60 + dividedPeriods[chunks - 1].start.minute);
    expect(lastChunkDuration).toBe(chunkDuration + lastChunkExtra);
  });
});

describe('TimeUtils.prettifyTime', () => {
  test('formats midday time correctly', () => {
    const time = { hour: 12, minute: 30, second: 45 };
    const prettyTime = TimeUtils.prettifyTime(time);
    expect(prettyTime).toBe('12:30:45');
  });

  test('formats early morning time with leading zeros', () => {
    const time = { hour: 7, minute: 5, second: 9 };
    const prettyTime = TimeUtils.prettifyTime(time);
    expect(prettyTime).toBe('07:05:09');
  });

  test('formats late night time correctly', () => {
    const time = { hour: 23, minute: 59, second: 59 };
    const prettyTime = TimeUtils.prettifyTime(time);
    expect(prettyTime).toBe('23:59:59');
  });

  test('handles rounding of seconds correctly', () => {
    const time = { hour: 14, minute: 49, second: 59.99 };
    const prettyTime = TimeUtils.prettifyTime(time);
    expect(prettyTime).toBe('14:49:60');
  });

  test('handles zero hour correctly', () => {
    const time = { hour: 0, minute: 0, second: 0 };
    const prettyTime = TimeUtils.prettifyTime(time);
    expect(prettyTime).toBe('00:00:00');
  });
});

describe('TimeUtils.isAfterOrEqual', () => {
  it('shall return true if one hour later', () => {
    const time1: Time = TimeUtils.parseTime('07:00');
    const time2: Time = TimeUtils.parseTime('06:00');
    expect(TimeUtils.isAfterOrEqual(time1, time2)).toBeTruthy();
  });

  it('shall return true if same hour, but minutes later', () => {
    const time1: Time = TimeUtils.parseTime('06:00');
    const time2: Time = TimeUtils.parseTime('06:01');
    expect(TimeUtils.isAfterOrEqual(time1, time2)).toBeTruthy();
  });

  it('shall return true if same hour, but seconds later', () => {
    const time1: Time = {
      hour: 6,
      minute: 1,
      second: 1
    };
    const time2: Time = {
      hour: 6,
      minute: 1,
      second: 0
    };
    expect(TimeUtils.isAfterOrEqual(time1, time2)).toBeTruthy();
  });
});

describe('TimeUtils.isBefore', () => {
  it('shall return true if one hour before', () => {
    const time1: Time = TimeUtils.parseTime('06:00');
    const time2: Time = TimeUtils.parseTime('07:00');
    expect(TimeUtils.isBefore(time1, time2)).toBeTruthy();
  });

  it('shall return true if same hour, but minutes before', () => {
    const time1: Time = TimeUtils.parseTime('06:00');
    const time2: Time = TimeUtils.parseTime('06:01');
    expect(TimeUtils.isBefore(time1, time2)).toBeTruthy();
  });

  it('shall return true if same hour, but seconds before', () => {
    const time1: Time = {
      hour: 6,
      minute: 1,
      second: 0
    };
    const time2: Time = {
      hour: 6,
      minute: 1,
      second: 1
    };
    expect(TimeUtils.isBefore(time1, time2)).toBeTruthy();
  });
});

describe('getMySQLNow', () => {
  it('shall return the current date and time in MySQL format', () => {
    const now = new Date();

    // We use a tolerance of 1 second to account for the time difference between the call and assertion
    const actualResult = TimeUtils.getMySQLNow();
    const actualDate = new Date(actualResult.replace(' ', 'T') + 'Z');

    const differenceInSeconds = Math.abs((actualDate.getTime() - now.getTime()) / 1000);
    expect(differenceInSeconds).toBeLessThanOrEqual(1);

    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    expect(actualResult).toMatch(regex);
  });
});

describe('timeToMinutesSinceStart', () => {
  it('shall calculate correct minutes for default day', () => {
    expect(TimeUtils.timeToMinutesSinceStart(TimeUtils.parseTime('21:30'), TimeUtils.parseTime('06:00'))).toBe(930);
  });

  it('shall calculate correct minutes for default day', () => {
    expect(TimeUtils.timeToMinutesSinceStart(TimeUtils.parseTime('00:30'), TimeUtils.parseTime('06:00'))).toBe(1110);
  });
});

describe('checkTimeout', () => {
  it('shall return true if timeout has passed', () => {
    const startTime = Date.now() - 5000; // 5 seconds ago
    const timeout = 3000; // 3 seconds timeout
    expect(TimeUtils.checkTimeout({ startTime, timeout })).toBeTruthy();
  });

  it('shall return false if timeout has not passed', () => {
    const startTime = Date.now() - 2000; // 2 seconds ago
    const timeout = 3000; // 3 seconds timeout
    expect(TimeUtils.checkTimeout({ startTime, timeout })).toBeFalsy();
  });

  it('shall return true if timeout is exactly the elapsed time', () => {
    const startTime = Date.now() - 3000; // 3 seconds ago
    const timeout = 3000; // 3 seconds timeout
    expect(TimeUtils.checkTimeout({ startTime, timeout })).toBeTruthy();
  });

  it('shall return false if startTime is in the future', () => {
    const startTime = Date.now() + 1000; // 1 second in the future
    const timeout = 3000; // 3 seconds timeout
    expect(TimeUtils.checkTimeout({ startTime, timeout })).toBeFalsy();
  });
});
describe('TimeUtils.durationInMinutes', () => {
  it('shall calculate duration correctly within the same day', () => {
    const period: TimePeriod = {
      start: { hour: 9, minute: 0, second: 0 },
      end: { hour: 17, minute: 0, second: 0 }
    };
    expect(TimeUtils.durationInMinutes(period)).toBe(480); // 8 hours
  });

  it('shall calculate duration correctly across midnight', () => {
    const period: TimePeriod = {
      start: { hour: 22, minute: 0, second: 0 },
      end: { hour: 6, minute: 0, second: 0 }
    };
    expect(TimeUtils.durationInMinutes(period)).toBe(480); // 8 hours
  });

  it('shall calculate duration correctly for a period less than an hour', () => {
    const period: TimePeriod = {
      start: { hour: 10, minute: 0, second: 0 },
      end: { hour: 10, minute: 30, second: 0 }
    };
    expect(TimeUtils.durationInMinutes(period)).toBe(30); // 30 minutes
  });

  it('shall calculate duration correctly for a period spanning multiple hours', () => {
    const period: TimePeriod = {
      start: { hour: 14, minute: 45, second: 0 },
      end: { hour: 18, minute: 15, second: 0 }
    };
    expect(TimeUtils.durationInMinutes(period)).toBe(210); // 3 hours and 30 minutes
  });
});
