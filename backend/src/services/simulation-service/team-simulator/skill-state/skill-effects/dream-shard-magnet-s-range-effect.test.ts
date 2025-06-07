import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { DreamShardMagnetSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s-range-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { DreamShardMagnetSRange } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('DreamShardMagnetSRangeEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let dreamShardMagnetSRangeEffect: DreamShardMagnetSRangeEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    dreamShardMagnetSRangeEffect = new DreamShardMagnetSRangeEffect();
  });

  it('should activate skill correctly', () => {
    const regularAmount = 15;
    vimic(skillState, 'skillAmount', () => regularAmount);

    const result = dreamShardMagnetSRangeEffect.activate(skillState);

    expect(result).toEqual({
      skill: DreamShardMagnetSRange,
      activations: [
        {
          unit: 'dream shards',
          self: { regular: regularAmount, crit: 0 }
        }
      ]
    });
  });

  it('should handle zero skill amount correctly', () => {
    vimic(skillState, 'skillAmount', () => 0);

    const result = dreamShardMagnetSRangeEffect.activate(skillState);

    expect(result).toEqual({
      skill: DreamShardMagnetSRange,
      activations: [
        {
          unit: 'dream shards',
          self: { regular: 0, crit: 0 }
        }
      ]
    });
  });
});
