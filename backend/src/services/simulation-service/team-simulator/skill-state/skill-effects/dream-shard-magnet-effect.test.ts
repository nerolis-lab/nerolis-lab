import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { DreamShardMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('DreamShardMagnetSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let dreamShardMagnetSEffect: DreamShardMagnetSEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    dreamShardMagnetSEffect = new DreamShardMagnetSEffect();
  });

  it('should activate skill and return correct values', () => {
    const regularAmount = 15;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = dreamShardMagnetSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.DREAM_SHARD_MAGNET_S,
      selfValue: {
        regular: regularAmount,
        crit: 0
      }
    });
  });

  it('should handle zero skill amount correctly', () => {
    vimic(skillState, 'skillAmount', () => 0);

    const result = dreamShardMagnetSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.DREAM_SHARD_MAGNET_S,
      selfValue: {
        regular: 0,
        crit: 0
      }
    });
  });

  it('should handle negative skill amount correctly', () => {
    vimic(skillState, 'skillAmount', () => -5);

    const result = dreamShardMagnetSEffect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.DREAM_SHARD_MAGNET_S,
      selfValue: {
        regular: -5,
        crit: 0
      }
    });
  });
});
