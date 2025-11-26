import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type {
  SkillActivation,
  UnitActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  ingredientSetToFloatFlat,
  PresentIngredientMagnetS
} from 'sleepapi-common';

export class IngredientMagnetSPresentEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = PresentIngredientMagnetS;
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

    const activations: UnitActivation[] = [
      {
        unit: 'ingredients',
        self: { regular: ingMagnetAmount, crit: 0 }
      }
    ];

    // Add candy to a random team member if roll succeeds
    const rngValue = skillState.rng();
    const candyChance = skill.candyChance;
    if (rngValue < candyChance) {
      activations.push({
        unit: 'candy',
        team: { regular: skill.candyAmount, crit: 0 }
      });
    }

    return {
      skill,
      activations
    };
  }
}
