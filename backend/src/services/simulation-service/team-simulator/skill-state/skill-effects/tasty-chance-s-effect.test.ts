import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { TastyChanceSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/tasty-chance-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TastyChanceSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let tastyChanceSEffect: TastyChanceSEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    tastyChanceSEffect = new TastyChanceSEffect();
  });

  it('should add crit bonus to cooking state correctly', () => {
    const critAmount = 20;
    vimic(skillState, 'skillAmount', () => critAmount);
    const addCritBonusMock = vimic(memberState.cookingState!, 'addCritBonus');

    const result = tastyChanceSEffect.activate(skillState);

    expect(addCritBonusMock).toHaveBeenCalledWith(critAmount / 100);
    expect(result).toEqual({
      skill: mainskill.TASTY_CHANCE_S,
      selfValue: { regular: critAmount, crit: 0 }
    });
  });

  it('should handle no cooking state correctly', () => {
    memberState.cookingState = undefined;
    const critAmount = 20;
    vimic(skillState, 'skillAmount', () => critAmount);

    const result = tastyChanceSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.TASTY_CHANCE_S,
      selfValue: { regular: critAmount, crit: 0 }
    });
  });
});
