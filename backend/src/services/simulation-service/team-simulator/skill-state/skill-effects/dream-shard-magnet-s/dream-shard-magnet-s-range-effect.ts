import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { DreamShardMagnetSRange } from 'sleepapi-common';

export class DreamShardMagnetSRangeEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = DreamShardMagnetSRange;
    return {
      skill,
      activations: [
        {
          unit: 'dream shards',
          self: { regular: skillState.skillAmount(skill.activations.dreamShards), crit: 0 }
        }
      ]
    };
  }
}
