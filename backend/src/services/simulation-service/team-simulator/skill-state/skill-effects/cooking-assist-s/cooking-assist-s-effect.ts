import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  CookingAssistS,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class CookingAssistSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingAssistS;
    const ingredientAmount = skillState.skillAmount(skill.activations.ingredients);
    const magnetIngredients = emptyIngredientInventoryFloat().fill(
      ingredientAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );

    skillState.memberState.cookingState?.addIngredients(magnetIngredients);

    skillState.memberState.skillProduce.ingredients = flatToIngredientSet(
      ingredientSetToFloatFlat(skillState.memberState.skillProduce.ingredients)._mutateCombine(
        magnetIngredients,
        (a, b) => a + b
      )
    );

    return {
      skill,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingredientAmount, crit: 0 }
        }
      ]
    };
  }
}
