import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingAssistS, emptyIngredientInventoryFloat, flatToIngredientSet, ingredient } from 'sleepapi-common';

export class CookingAssistSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingAssistS;
    const ingredientAmount = skillState.skillAmount(skill.activations.ingredients);
    const flatIngredients = emptyIngredientInventoryFloat().fill(
      ingredientAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );
    const ingredients = flatToIngredientSet(flatIngredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);
    skillState.memberState.addSkillProduce({ berries: [], ingredients });

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
