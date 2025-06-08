import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { HelperBoostEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/helper-boost-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { HelperBoost, MAX_TEAM_SIZE } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('HelperBoostEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let helperBoostEffect: HelperBoostEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    helperBoostEffect = new HelperBoostEffect();
  });

  it('should calculate regular amount correctly with unique members', () => {
    const regularAmount = 20;
    const uniqueHelps = 5;
    HelperBoost.uniqueBoostTable[1] = [uniqueHelps];
    HelperBoost.baseAmounts[0] = regularAmount;
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = helperBoostEffect.activate(skillState);

    expect(result).toEqual({
      skill: HelperBoost,
      activations: [
        {
          unit: 'helps',
          team: { regular: regularAmount + uniqueHelps, crit: 0 }
        }
      ]
    });
  });

  it('should count only 1 unique if team size greater than MAX_TEAM_SIZE', () => {
    const regularAmount = 20;
    HelperBoost.uniqueBoostTable[1] = [1];
    HelperBoost.baseAmounts[0] = regularAmount;

    memberState = mocks.memberState({
      team: new Array(MAX_TEAM_SIZE + 1).fill(mocks.teamMemberExt())
    });
    skillState = mocks.skillState(memberState);
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = helperBoostEffect.activate(skillState);

    expect(result).toEqual({
      skill: HelperBoost,
      activations: [
        {
          unit: 'helps',
          team: { regular: regularAmount + 1, crit: 0 }
        }
      ]
    });
  });

  it('should handle zero skill amount correctly', () => {
    const regularAmount = 0;
    HelperBoost.uniqueBoostTable[1] = [0];
    HelperBoost.baseAmounts[0] = regularAmount;

    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = helperBoostEffect.activate(skillState);

    expect(result).toEqual({
      skill: HelperBoost,
      activations: [
        {
          unit: 'helps',
          team: { regular: regularAmount, crit: 0 }
        }
      ]
    });
  });
});
