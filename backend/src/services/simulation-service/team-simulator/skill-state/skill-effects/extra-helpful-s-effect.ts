import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ExtraHelpfulS } from 'sleepapi-common';

export class ExtraHelpfulSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = ExtraHelpfulS;
    const regularAmount = skillState.skillAmount(skill.activations.helps) / skillState.memberState.teamSize;

    return {
      skill,
      activations: [
        {
          unit: 'helps',
          team: {
            regular: regularAmount,
            crit: 0
          }
        }
      ]
    };
  }
}
