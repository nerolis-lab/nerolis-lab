import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergyForEveryoneEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EnergyForEveryoneEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let energyForEveryoneEffect: EnergyForEveryoneEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    energyForEveryoneEffect = new EnergyForEveryoneEffect();
  });

  it('should activate energy for everyone correctly', () => {
    const regularAmount = 15;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = energyForEveryoneEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGY_FOR_EVERYONE,
      teamValue: {
        regular: regularAmount,
        crit: 0
      }
    });
  });

  it('should handle different skill amounts correctly', () => {
    const regularAmount = 20;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = energyForEveryoneEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGY_FOR_EVERYONE,
      teamValue: {
        regular: regularAmount,
        crit: 0
      }
    });
  });
});
