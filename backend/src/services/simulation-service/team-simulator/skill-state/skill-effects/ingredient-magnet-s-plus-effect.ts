import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  CookingPowerUpSMinus,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  ingredient,
  IngredientMagnetSPlus,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class IngredientMagnetSPlusEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientMagnetSPlus;
    const ingMagnetAmount = skillState.skillAmount(skill.activations.solo);

    const ingredients = emptyIngredientInventoryFloat().fill(ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS);

    const bonusAmount =
      skillState.memberState.otherMembers.filter((member) =>
        member.skill.is(IngredientMagnetSPlus, CookingPowerUpSMinus)
      ).length === 0
        ? 0
        : skillState.skillAmount(skill.activations.paired);

    ingredients[
      ING_ID_LOOKUP[skillState.memberState.member.pokemonWithIngredients.ingredientList[0].ingredient.name]
    ] += bonusAmount;

    skillState.memberState.cookingState?.addIngredients(ingredients);

    skillState.memberState.skillProduce.ingredients = flatToIngredientSet(
      ingredientSetToFloatFlat(skillState.memberState.skillProduce.ingredients)._mutateCombine(
        ingredients,
        (a, b) => a + b
      )
    );

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
