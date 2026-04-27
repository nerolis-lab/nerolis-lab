import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingPowerUpS } from 'sleepapi-common';

export class CookingPowerUpSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingPowerUpS;
    const potAmount = skillState.skillAmount(skill.activations.potSize);
    skillState.memberState.cookingState?.addPotSize(potAmount);

    return {
      skill,
      activations: [
        {
          unit: 'pot size',
          self: { regular: potAmount, crit: 0 }
        }
      ]
    };
  }
}
