import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  IngredientMagnetS,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class IngredientMagnetSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientMagnetS;
    const ingMagnetAmount = skillState.skillAmount(skill.activations.ingredients);
    const magnetIngredients = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
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
          self: { regular: ingMagnetAmount, crit: 0 }
        }
      ]
    };
  }
}
