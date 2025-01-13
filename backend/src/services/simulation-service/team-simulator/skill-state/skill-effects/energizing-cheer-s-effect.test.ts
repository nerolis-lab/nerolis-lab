import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state.js';
import { EnergizingCheerSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EnergizingCheerSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let energizingCheerSEffect: EnergizingCheerSEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    energizingCheerSEffect = new EnergizingCheerSEffect();
  });

  it('should activate skill and return correct team value', () => {
    const regularEnergyAmount = 20;
    const chanceToTargetLowest = mainskill.ENERGIZING_CHEER_TARGET_LOWEST_CHANCE;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      teamValue: {
        regular: regularEnergyAmount,
        crit: 0,
        chanceToTargetLowestMember: chanceToTargetLowest
      }
    });
  });

  it('should handle different skill amounts correctly', () => {
    const regularEnergyAmount = 30;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result.teamValue?.regular).toBe(regularEnergyAmount);
  });

  it('should handle zero skill amount correctly', () => {
    const regularEnergyAmount = 0;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result.teamValue?.regular).toBe(regularEnergyAmount);
  });
});
