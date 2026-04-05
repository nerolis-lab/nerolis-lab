import type { Time } from '../../types';
import { MathUtils } from '../math-utils';

// Minutes of sleep that maps to sleep score 100 before capping (8h 30m).
export const MAX_SLEEP_SCORE_MINUTES = 510;

// Sleep score 0–100 from total sleep duration
// Values below zero are treated as zero; non-finite values yield 0
export function sleepScoreFromDurationMinutes(durationInMinutes: number): number {
  const safeMinutes = Number.isFinite(durationInMinutes) ? Math.max(0, durationInMinutes) : 0;
  return Math.min(100, Math.round((safeMinutes / MAX_SLEEP_SCORE_MINUTES) * 100));
}

// Sleep duration in minutes between clock times 'HH:MM', wrapping past midnight when wake is before bed
export function sleepDurationMinutesBetweenBedAndWake(params: { bedtime: string; wakeup: string }): number {
  const [bedHour, bedMinute] = params.bedtime.split(':').map(Number);
  const [wakeHour, wakeMinute] = params.wakeup.split(':').map(Number);

  const bedTimeMinutes = bedHour * 60 + bedMinute;
  const wakeTimeMinutes = wakeHour * 60 + wakeMinute;

  // calculate duration, handling the case where we wrap past midnight
  let durationInMinutes = wakeTimeMinutes - bedTimeMinutes;
  if (durationInMinutes < 0) {
    durationInMinutes += 1440; // add 24 hours worth of minutes
  }

  return durationInMinutes;
}

export function sleepScoreFromBedAndWake(params: { bedtime: string; wakeup: string }): number {
  return sleepScoreFromDurationMinutes(sleepDurationMinutesBetweenBedAndWake(params));
}

export function parseTime(time: string): Time {
  const [hour, minute] = time.split(':').map((t) => +t);
  return {
    hour,
    minute,
    second: 0
  };
}

export function prettifyTime(time: Time) {
  const hourString = String(time.hour).padStart(2, '0');
  const minuteString = String(time.minute).padStart(2, '0');
  const secondString = String(MathUtils.round(time.second, 0)).padStart(2, '0');

  return `${hourString}:${minuteString}:${secondString}`;
}
