import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { DreamShardMagnetSAuraSphere } from 'sleepapi-common';

export class DreamShardMagnetSAuraSphereEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = DreamShardMagnetSAuraSphere;
    return {
      skill,
      activations: [
        {
          unit: 'dream shards',
          self: { regular: skillState.skillAmount(skill.activations.dreamShards), crit: 0 }
        },
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(skill.activations.strength), crit: 0 }
        }
      ]
    };
  }
}
