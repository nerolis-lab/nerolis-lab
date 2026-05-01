import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { IngredientDrawS, ingredientSetToFloatFlat, type Ingredient } from 'sleepapi-common';

export class IngredientDrawSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawS;
    const nrOfIngredients = skillState.skillAmount(skill.activations.ingredients);

    const ingredient: Ingredient = skillState.rng.randomElement(
      skillState.memberState.member.pokemonWithIngredients.pokemon.ingredient60.map((ingSet) => ingSet.ingredient)
    );

    const ingredients = [{ amount: nrOfIngredients, ingredient }];
    const flatIngredients = ingredientSetToFloatFlat(ingredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);
    skillState.memberState.addSkillProduce({ berries: [], ingredients });

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
