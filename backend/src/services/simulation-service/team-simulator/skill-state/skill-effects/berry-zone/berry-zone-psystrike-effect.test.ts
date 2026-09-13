import { mocks } from '@src/vitest/index.js';
import { berry, BerryZonePsystrike, type MainskillActivation } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';
import { BerryZonePsystrikeEffect } from './berry-zone-psystrike-effect.js';

describe('BerryZonePsystrikeEffect', () => {
  it('uses skill amounts for both strength and the shared Mago zone activation', () => {
    const member = mocks.memberState();
    const skillState = mocks.skillState(member);
    const zoneAmount = 3;
    const strengthAmount = 100;
    vimic(skillState, 'skillAmount', (activation: MainskillActivation) =>
      activation.unit === 'berry zone' ? zoneAmount : strengthAmount
    );
    const addBonus = vimic(member.berryZoneState, 'addBonus');
    const result = new BerryZonePsystrikeEffect().activate(skillState);
    expect(addBonus).toHaveBeenCalledWith(berry.MAGO, zoneAmount, BerryZonePsystrike.maximumBonus);
    expect(result).toEqual({
      skill: BerryZonePsystrike,
      activations: [
        { unit: 'strength', self: { regular: strengthAmount, crit: 0 } },
        { unit: 'berry zone', self: { regular: zoneAmount, crit: 0 } }
      ]
    });
  });

  it('still grants strength when the zone is capped', () => {
    const member = mocks.memberState();
    const skillState = mocks.skillState(member);
    vimic(skillState, 'skillAmount', (activation: MainskillActivation) => (activation.unit === 'strength' ? 100 : 3));
    member.berryZoneState.addBonus(berry.MAGO, BerryZonePsystrike.maximumBonus, BerryZonePsystrike.maximumBonus);
    const activation = new BerryZonePsystrikeEffect().activate(skillState);
    expect(activation.activations[0].self?.regular).toBe(100);
    expect(member.berryZoneState.bonusPercentage(berry.MAGO)).toBe(BerryZonePsystrike.maximumBonus);
  });
});
