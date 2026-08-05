import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { VersatileSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/versatile/versatile-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { Versatile } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('VersatileSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let versatileSEffect: VersatileSEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    versatileSEffect = new VersatileSEffect();
  });

  it('should include bonus candy when the roll succeeds', () => {
    skillState.memberState.member.settings.skillLevel = 6; // non-zero bonus candy amount
    vimic(skillState, 'rng', () => 0.1); // Roll succeeds (0.1 < 0.3)

    const result = versatileSEffect.activate(skillState);

    expect(result).toEqual({
      skill: Versatile,
      activations: [
        {
          unit: 'candy',
          self: { regular: Versatile.candyAmount, crit: Versatile.bonusCandyAmount[5] }
        }
      ]
    });
  });

  it('should not include bonus candy when the roll fails', () => {
    skillState.memberState.member.settings.skillLevel = 6; // non-zero bonus candy amount
    vimic(skillState, 'rng', () => 0.5); // Roll fails (0.5 >= 0.3)

    const result = versatileSEffect.activate(skillState);

    expect(result).toEqual({
      skill: Versatile,
      activations: [
        {
          unit: 'candy',
          self: { regular: Versatile.candyAmount, crit: 0 }
        }
      ]
    });
  });
});
