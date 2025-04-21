import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { ExtraHelpfulSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/extra-helpful-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ExtraHelpfulSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let extraHelpfulSEffect: ExtraHelpfulSEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    extraHelpfulSEffect = new ExtraHelpfulSEffect();
  });

  it('should calculate regular amount correctly', () => {
    const regularAmount = 20;
    memberState = mocks.memberState({
      team: [mocks.teamMemberExt(), mocks.teamMemberExt(), mocks.teamMemberExt(), mocks.teamMemberExt()]
    });
    skillState = mocks.skillState(memberState);
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = extraHelpfulSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      teamValue: {
        regular: regularAmount / memberState.teamSize,
        crit: 0
      }
    });
  });

  it('should handle team size of 1 correctly', () => {
    const regularAmount = 20;
    vimic(skillState, 'skillAmount', () => regularAmount);
    memberState = mocks.memberState({
      team: [mocks.teamMemberExt()]
    });

    const result = extraHelpfulSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      teamValue: {
        regular: regularAmount,
        crit: 0
      }
    });
  });

  it('should handle zero skill amount correctly', () => {
    const regularAmount = 0;
    vimic(skillState, 'skillAmount', () => regularAmount);
    memberState = mocks.memberState({
      team: [mocks.teamMemberExt(), mocks.teamMemberExt(), mocks.teamMemberExt(), mocks.teamMemberExt()]
    });

    const result = extraHelpfulSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      teamValue: {
        regular: 0,
        crit: 0
      }
    });
  });
});
