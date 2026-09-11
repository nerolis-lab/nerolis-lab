import { describe, expect, it } from 'vitest';
import {
  getScheduleTarget,
  isConditionalSchedule,
  validateScheduleTarget,
  withScheduleTarget
} from './conditional-schedule';
import type { TeamScheduleShift } from '../../types/team/team';

const shift: TeamScheduleShift = {
  slotIndex: 0,
  externalId: 'a',
  startTime: '06:00',
  type: 'tasty-chance',
  tastyChanceTarget: 30
};

describe('conditional schedule targets', () => {
  it('supports a capped Psychic berry-zone target and clears it when changing type', () => {
    const zone = withScheduleTarget(shift, 'berry-zone', 24);
    expect(getScheduleTarget(zone)).toBe(24);
    expect(zone.tastyChanceTarget).toBeUndefined();
    expect(withScheduleTarget(zone, 'time').berryZoneTarget).toBeUndefined();
    expect(validateScheduleTarget('berry-zone', 24)).toBe('');
    expect(validateScheduleTarget('berry-zone', 24.1)).not.toBe('');
    expect(validateScheduleTarget('berry-zone', 0)).not.toBe('');
  });
  it('keeps legacy time schedules separate from conditional schedules', () => {
    expect(isConditionalSchedule(undefined)).toBe(false);
    expect(isConditionalSchedule('time')).toBe(false);
    expect(isConditionalSchedule('tasty-chance')).toBe(true);
    expect(isConditionalSchedule('pot-size')).toBe(true);
  });
  it('removes stale targets when changing rotation types without mutating the draft', () => {
    const pot = withScheduleTarget(shift, 'pot-size', 150);
    expect(pot.tastyChanceTarget).toBeUndefined();
    expect(getScheduleTarget(pot)).toBe(150);
    expect(getScheduleTarget(shift)).toBe(30);
    expect(withScheduleTarget(pot, 'time').potSizeTarget).toBeUndefined();
  });
  it('does not supply a saved target to the replacement member', () => {
    expect(getScheduleTarget(withScheduleTarget(shift, 'tasty-chance'))).toBeUndefined();
  });
  it('allows fractional chances but requires whole pot capacities', () => {
    expect(validateScheduleTarget('tasty-chance', 30.5)).toBe('');
    expect(validateScheduleTarget('pot-size', 30.5)).not.toBe('');
    expect(validateScheduleTarget('tasty-chance', 71)).not.toBe('');
    expect(validateScheduleTarget('pot-size', Infinity)).not.toBe('');
  });
});
