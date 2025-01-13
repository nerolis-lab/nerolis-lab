import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state.js';
import { ChargeEnergySEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ChargeEnergySEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let chargeEnergySEffect: ChargeEnergySEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    chargeEnergySEffect = new ChargeEnergySEffect();
  });

  it('should recover energy correctly', () => {
    vimic(skillState, 'skillAmount', () => 50);
    memberState.currentEnergy = 0;
    memberState.totalRecovery = 0;
    const wasteEnergyMock = vimic(memberState, 'wasteEnergy');

    const result = chargeEnergySEffect.activate(skillState);

    expect(skillState.memberState.currentEnergy).toBe(50);
    expect(skillState.memberState.totalRecovery).toBe(50);
    expect(wasteEnergyMock).toHaveBeenCalledWith(0);
    expect(result).toEqual({
      skill: mainskill.CHARGE_ENERGY_S,
      selfValue: { regular: 50, crit: 0 }
    });
  });

  it('should clamp energy recovery to max energy', () => {
    skillState.skillAmount = () => 20;
    memberState.currentEnergy = 140;
    memberState.totalRecovery = 0;
    const wasteEnergyMock = vimic(memberState, 'wasteEnergy');

    const result = chargeEnergySEffect.activate(skillState);

    expect(skillState.memberState.currentEnergy).toBe(150);
    expect(skillState.memberState.totalRecovery).toBe(10);
    expect(wasteEnergyMock).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      skill: mainskill.CHARGE_ENERGY_S,
      selfValue: { regular: 10, crit: 0 }
    });
  });
});
