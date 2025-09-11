import type { Time } from '../../../types';
import { parseTime } from '../../../utils';

export function time(attrs?: Partial<Time>): Time {
  return {
    hour: 0,
    minute: 0,
    second: 0,
    ...attrs
  };
}

export const BEDTIME = '21:30';
export function bedtime(attrs?: Partial<Time>): Time {
  return {
    ...parseTime(BEDTIME),
    ...attrs
  };
}
export const WAKEUP = '06:00';
export function wakeup(attrs?: Partial<Time>): Time {
  return {
    ...parseTime(WAKEUP),
    ...attrs
  };
}
