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
  IngredientMagnetSPresent
} from 'sleepapi-common';

export class IngredientMagnetSPresentEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientMagnetSPresent;
    const ingMagnetAmount = skillState.skillAmount(skill.activations.ingredients);
    const flatIngredients = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );
    const ingredients = flatToIngredientSet(flatIngredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);
    skillState.memberState.addSkillProduce({ berries: [], ingredients });

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
