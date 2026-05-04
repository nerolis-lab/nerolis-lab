/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { ChargeEnergySEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s/charge-energy-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeEnergyS } from 'sleepapi-common';
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
    (memberState as any).currentEnergy = 0;
    (memberState as any).totalRecovery = 0;
    (memberState as any).wastedEnergy = 0;

    const result = chargeEnergySEffect.activate(skillState);

    expect((memberState as any).currentEnergy).toBe(50);
    expect((memberState as any).totalRecovery).toBe(50);
    expect((memberState as any).wastedEnergy).toBe(0);
    expect(result).toEqual({
      skill: ChargeEnergyS,
      activations: [
        {
          unit: 'energy',
          self: { regular: 50, crit: 0 }
        }
      ]
    });
  });

  it('should clamp energy recovery to max energy', () => {
    vimic(skillState, 'skillAmount', () => 30);
    (memberState as any).currentEnergy = 140;
    (memberState as any).totalRecovery = 0;
    (memberState as any).wastedEnergy = 0;

    const result = chargeEnergySEffect.activate(skillState);

    expect((memberState as any).currentEnergy).toBe(150);
    expect((memberState as any).totalRecovery).toBe(10);
    expect((memberState as any).wastedEnergy).toBe(20);
    expect(result).toEqual({
      skill: ChargeEnergyS,
      activations: [
        {
          unit: 'energy',
          self: { regular: 10, crit: 0 }
        }
      ]
    });
  });
});
