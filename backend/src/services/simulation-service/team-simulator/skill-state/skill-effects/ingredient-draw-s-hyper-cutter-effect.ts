import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  IngredientDrawSHyperCutter,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class IngredientDrawSHyperCutterEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawSHyperCutter;

    const roll = skillState.rng();
    const { amountFunc, critAmountFunc, ingredient } = skill.rollToResult(roll);
    const amount = amountFunc(skillState.skillLevel);
    const critAmount = critAmountFunc(skillState.skillLevel);
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

    return {
      skill,
      activations: [
        {
          unit: 'ingredients',
          self: {
            regular: amount,
            crit: critAmount
          }
        }
      ]
    };
  }
}
