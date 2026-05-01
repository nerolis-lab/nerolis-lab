import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingAssistSBulkUp, emptyIngredientInventoryFloat, flatToIngredientSet, ingredient } from 'sleepapi-common';

export class CookingAssistSBulkUpEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingAssistSBulkUp;
    const ingredientAmount = skillState.skillAmount(skill.activations.ingredients);
    const critAmount = skillState.skillAmount(skill.activations.critChance);
    const flatIngredients = emptyIngredientInventoryFloat().fill(
      ingredientAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );
    const ingredients = flatToIngredientSet(flatIngredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);
    skillState.memberState.addSkillProduce({ berries: [], ingredients });

    skillState.memberState.cookingState?.addCritBonus(critAmount / 100);

    return {
      skill,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingredientAmount, crit: 0 }
        },
        {
          unit: 'crit chance',
          self: { regular: critAmount, crit: 0 }
        }
      ]
    };
  }
}
