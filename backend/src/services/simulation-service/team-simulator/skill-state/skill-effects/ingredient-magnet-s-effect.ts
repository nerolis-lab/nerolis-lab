import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  ingredientSetToFloatFlat,
  mainskill
} from 'sleepapi-common';

export class IngredientMagnetSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.INGREDIENT_MAGNET_S;
    const ingMagnetAmount = skillState.skillAmount(skill);
    const magnetIngredients = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );

    skillState.memberState.cookingState?.addIngredients(magnetIngredients);

    skillState.memberState.totalProduce.ingredients = flatToIngredientSet(
      ingredientSetToFloatFlat(skillState.memberState.totalProduce.ingredients)._mutateCombine(
        magnetIngredients,
        (a, b) => a + b
      )
    );

    return {
      skill,
      selfValue: { regular: ingMagnetAmount, crit: 0 }
    };
  }
}
