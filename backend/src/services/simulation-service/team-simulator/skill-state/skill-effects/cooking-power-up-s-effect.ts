import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class CookingPowerUpSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.COOKING_POWER_UP_S;
    const potAmount = skillState.skillAmount(skill);
    skillState.memberState.cookingState?.addPotSize(potAmount);

    return {
      skill,
      selfValue: { regular: potAmount, crit: 0 }
    };
  }
}
