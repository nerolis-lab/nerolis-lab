import { berry } from 'sleepapi-common';
import { describe, expect, it, vi } from 'vitest';
import type { TeamScheduleShift } from 'sleepapi-common';
import type { CookingState } from './cooking-state/cooking-state.js';
import { BerryZoneState } from './berry-zone-state.js';
import { scheduleTargetReached } from './conditional-schedule.js';

const shift: TeamScheduleShift = {
  slotIndex: 0,
  externalId: 'a',
  startTime: '06:00',
  type: 'tasty-chance',
  tastyChanceTarget: 30
};
const cookingState = {
  extraTastyChancePercentage: () => 30,
  currentPotSize: vi.fn((sunday: boolean) => (sunday ? 200 : 100))
} as unknown as CookingState;

describe('rotation bonus readers', () => {
  it('uses the primary member’s berry zone without mixing bonuses from other types', () => {
    const berryZoneState = new BerryZoneState();
    const shift: TeamScheduleShift = {
      slotIndex: 0,
      externalId: 'electric',
      startTime: '06:00',
      type: 'berry-zone',
      berryZoneTarget: 12
    };
    berryZoneState.addBonus(berry.MAGO, 24, 24);
    expect(scheduleTargetReached(shift, { berryZoneState, primaryBerry: berry.GREPA, sunday: false })).toBe(false);
    berryZoneState.addBonus(berry.GREPA, 12, 24);
    expect(scheduleTargetReached(shift, { berryZoneState, primaryBerry: berry.GREPA, sunday: false })).toBe(true);
    expect(berryZoneState.bonusPercentage(berry.MAGO)).toBe(24);
    berryZoneState.reset();
    expect(berryZoneState.bonusPercentage(berry.MAGO)).toBe(0);
    expect(berryZoneState.bonusPercentage(berry.GREPA)).toBe(0);
  });
  it('reads berry-zone targets without cooking state', () => {
    const berryZoneState = new BerryZoneState();
    const zone: TeamScheduleShift = { ...shift, type: 'berry-zone', berryZoneTarget: 24 };
    berryZoneState.addBonus(berry.MAGO, 20, 24);
    expect(scheduleTargetReached(zone, { berryZoneState, primaryBerry: berry.MAGO, sunday: false })).toBe(false);
    berryZoneState.addBonus(berry.MAGO, 20, 24);
    expect(scheduleTargetReached(zone, { berryZoneState, primaryBerry: berry.MAGO, sunday: false })).toBe(true);
  });
  it('switches at the target and returns when the bonus falls below it', () => {
    expect(scheduleTargetReached(shift, { cookingState, sunday: false })).toBe(true);
    expect(scheduleTargetReached({ ...shift, tastyChanceTarget: 31 }, { cookingState, sunday: false })).toBe(false);
  });
  it('uses Sunday capacity for pot targets', () => {
    const pot: TeamScheduleShift = { ...shift, type: 'pot-size', potSizeTarget: 150 };
    expect(scheduleTargetReached(pot, { cookingState, sunday: false })).toBe(false);
    expect(scheduleTargetReached(pot, { cookingState, sunday: true })).toBe(true);
  });
  it('does not switch when the bonus state or target is missing', () => {
    expect(scheduleTargetReached(shift, { sunday: false })).toBe(false);
    expect(scheduleTargetReached({ ...shift, tastyChanceTarget: undefined }, { cookingState, sunday: false })).toBe(
      false
    );
  });
});
