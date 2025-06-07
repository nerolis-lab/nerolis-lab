import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { TastyChanceS } from 'sleepapi-common';

export class TastyChanceSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = TastyChanceS;
    const critAmount = skillState.skillAmount(skill.activations.chance);
    skillState.memberState.cookingState?.addCritBonus(critAmount / 100);

    return {
      skill,
      activations: [
        {
          unit: 'crit chance',
          self: { regular: critAmount, crit: 0 }
        }
      ]
    };
  }
}
