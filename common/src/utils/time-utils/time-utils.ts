import type { Time } from '../../types';
import { MathUtils } from '../math-utils';

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
