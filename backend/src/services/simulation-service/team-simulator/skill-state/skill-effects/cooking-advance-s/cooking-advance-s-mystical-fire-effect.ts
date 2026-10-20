import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingAdvanceSMysticalFire } from 'sleepapi-common';

export class CookingAdvanceSMysticalFireEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingAdvanceSMysticalFire;
    const potAmount = skillState.skillAmount(skill.activations.potSize);
    const tastyAmount = skillState.skillAmount(skill.activations.tastyChance);

    skillState.memberState.cookingState?.addPotSize(potAmount);
    skillState.memberState.cookingState?.addCritBonus(tastyAmount / 100);

    return {
      skill,
      activations: [
        {
          unit: 'pot size',
          self: { regular: potAmount, crit: 0 }
        },
        {
          unit: 'crit chance',
          self: { regular: tastyAmount, crit: 0 }
        }
      ]
    };
  }
}
