import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergizingCheerSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { EnergizingCheerS } from 'sleepapi-common';
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
    const chanceToTargetLowest = EnergizingCheerS.activations.energy.targetLowestChance;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result).toEqual({
      skill: EnergizingCheerS,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: regularEnergyAmount,
            crit: 0,
            chanceToTargetLowestMember: chanceToTargetLowest
          }
        }
      ]
    });
  });

  it('should handle different skill amounts correctly', () => {
    const regularEnergyAmount = 30;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result.activations[0].team?.regular).toBe(regularEnergyAmount);
  });

  it('should handle zero skill amount correctly', () => {
    const regularEnergyAmount = 0;
    vimic(skillState, 'skillAmount', () => regularEnergyAmount);

    const result = energizingCheerSEffect.activate(skillState);

    expect(result.activations[0].team?.regular).toBe(regularEnergyAmount);
  });
});
