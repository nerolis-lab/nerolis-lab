import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  CookingPowerUpSMinus,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  ingredient,
  IngredientMagnetSPlus
} from 'sleepapi-common';

export class IngredientMagnetSPlusEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientMagnetSPlus;
    const ingMagnetAmount = skillState.skillAmount(skill.activations.solo);

    const flatIngredients = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );

    const bonusAmount =
      skillState.memberState.otherMembers.filter((member) =>
        member.skill.is(IngredientMagnetSPlus, CookingPowerUpSMinus)
      ).length === 0
        ? 0
        : skillState.skillAmount(skill.activations.paired, {
            ingredient: skillState.memberState.member.pokemonWithIngredients.ingredientList[0].ingredient
          });
    flatIngredients[
      ING_ID_LOOKUP[skillState.memberState.member.pokemonWithIngredients.ingredientList[0].ingredient.name]
    ] += bonusAmount;

    const ingredients = flatToIngredientSet(flatIngredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);

    skillState.memberState.addSkillProduce({ berries: [], ingredients });

    return {
      skill,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingMagnetAmount, crit: bonusAmount }
        }
      ]
    };
  }
}
