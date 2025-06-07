import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  ING_ID_LOOKUP,
  IngredientDrawS,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredientSetToFloatFlat,
  type Ingredient
} from 'sleepapi-common';

// TODO: this skill doesn't actually exist, but it will likely work similar to this
export class IngredientDrawSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawS;
    const nrOfIngredients = skillState.skillAmount(skill.activations.ingredients);

    const rolledIngredient: Ingredient = skillState.rng.randomElement(skill.ingredientDrawIngredients);

    const ingredientDrawIngredients = emptyIngredientInventoryFloat();
    ingredientDrawIngredients[ING_ID_LOOKUP[rolledIngredient.name]] = nrOfIngredients;

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
            regular: nrOfIngredients,
            crit: 0
          }
        }
      ]
    };
  }
}
