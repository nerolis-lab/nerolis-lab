import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  IngredientDrawSSuperLuck,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class IngredientDrawSSuperLuckEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawSSuperLuck;

    const roll = skillState.rng();
    const { amountFunc, critAmountFunc, ingredient, unit } = skill.rollToResult(roll);
    const amount = amountFunc({ skillLevel: skillState.skillLevel });
    const critAmount = critAmountFunc({ skillLevel: skillState.skillLevel });

    if (ingredient !== undefined) {
      const nrOfIngredients = amount + critAmount;

      const ingredientDrawIngredients = emptyIngredientInventoryFloat();
      ingredientDrawIngredients[ING_ID_LOOKUP[ingredient.name]] = nrOfIngredients;

      skillState.memberState.cookingState?.addIngredients(ingredientDrawIngredients);

      skillState.memberState.skillProduce.ingredients = flatToIngredientSet(
        ingredientSetToFloatFlat(skillState.memberState.skillProduce.ingredients)._mutateCombine(
          ingredientDrawIngredients,
          (a, b) => a + b
        )
      );
    }

    return {
      skill,
      activations: [
        {
          unit: unit,
          self: {
            regular: amount,
            crit: critAmount
          }
        }
      ]
    };
  }
}
