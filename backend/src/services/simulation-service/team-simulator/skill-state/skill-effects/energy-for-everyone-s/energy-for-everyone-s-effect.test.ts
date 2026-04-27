import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergyForEveryoneSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-s/energy-for-everyone-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { EnergyForEveryoneS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EnergyForEveryoneSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let energyForEveryoneEffect: EnergyForEveryoneSEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    energyForEveryoneEffect = new EnergyForEveryoneSEffect();
  });

  it('should activate energy for everyone correctly', () => {
    const regularAmount = 15;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = energyForEveryoneEffect.activate(skillState);

    expect(result).toEqual({
      skill: EnergyForEveryoneS,
      activations: [
        {
          unit: 'energy',
          team: { regular: regularAmount, crit: 0 }
        }
      ]
    });
  });

  it('should handle different skill amounts correctly', () => {
    const regularAmount = 20;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = energyForEveryoneEffect.activate(skillState);

    expect(result).toEqual({
      skill: EnergyForEveryoneS,
      activations: [
        {
          unit: 'energy',
          team: { regular: regularAmount, crit: 0 }
        }
      ]
    });
  });
});
