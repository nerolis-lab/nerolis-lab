import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingPowerUpSMinus, IngredientMagnetSPlus } from 'sleepapi-common';

export class CookingPowerUpSMinusEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingPowerUpSMinus;
    const potAmount = skillState.skillAmount(skill.activations.solo);
    skillState.memberState.cookingState?.addPotSize(potAmount);
    const energyAmount =
      skillState.memberState.otherMembers.filter((member) =>
        member.skill.is(IngredientMagnetSPlus, CookingPowerUpSMinus)
      ).length === 0
        ? 0
        : skillState.skillAmount(skill.activations.paired);
    const chanceToTargetLowestMember = skill.activations.paired.targetLowestChance;

    return {
      skill,
      activations: [
        {
          unit: 'pot size',
          self: { regular: potAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: {
            regular: energyAmount,
            crit: 0,
            chanceToTargetLowestMember
          }
        }
      ]
    };
  }
}
