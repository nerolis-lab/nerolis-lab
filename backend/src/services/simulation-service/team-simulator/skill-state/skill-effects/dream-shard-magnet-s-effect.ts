import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class DreamShardMagnetSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.DREAM_SHARD_MAGNET_S;
    return {
      skill,
      selfValue: { regular: skillState.skillAmount(skill), crit: 0 }
    };
  }
}
