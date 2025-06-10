import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import type { Ingredient } from 'sleepapi-common';
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
    const rolledIngredient: Ingredient = skillState.rng.randomElement(
      IngredientDrawSHyperCutter.ingredientDrawIngredients
    );

    const ingredientDrawIngredients = emptyIngredientInventoryFloat();

    let nonCritAmount = 0;
    let critAmount = 0;
    if (roll < skill.critChance) {
      critAmount = skill.activations.ingredients.critAmount(skillState.skillLevel);
      ingredientDrawIngredients[ING_ID_LOOKUP[rolledIngredient.name]] = critAmount;
    } else {
      nonCritAmount = skillState.skillAmount(skill.activations.ingredients);
      ingredientDrawIngredients[ING_ID_LOOKUP[rolledIngredient.name]] = nonCritAmount;
    }

    skillState.memberState.cookingState?.addIngredients(ingredientDrawIngredients);

    const produce = skillState.memberState.skillProduce;
    produce.ingredients = flatToIngredientSet(
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
            regular: nonCritAmount,
            crit: critAmount
          }
        }
      ]
    };
  }
}
