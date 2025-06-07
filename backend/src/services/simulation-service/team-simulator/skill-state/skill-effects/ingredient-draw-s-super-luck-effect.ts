import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import type { Ingredient } from 'sleepapi-common';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  IngredientDrawSSuperLuck,
  ingredientSetToFloatFlat
} from 'sleepapi-common';

export class IngredientDrawSSuperLuckEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawSSuperLuck;
    const nrOfIngredients = skillState.skillAmount(skill.activations.ingredients);

    const roll = skillState.rng();

    let critAmount = 0;
    if (roll < skill.critChance) {
      if (roll < skill.superCritChance) {
        critAmount = skill.activations.dreamShards.critAmount(skillState.skillLevel);
      } else {
        critAmount = skill.activations.dreamShards.amount(skillState.skillLevel);
      }

      return {
        skill,
        activations: [
          {
            unit: 'dream shards',
            self: {
              regular: 0,
              crit: critAmount
            }
          }
        ]
      };
    } else {
      const rolledIngredient: Ingredient = skillState.rng.randomElement(
        IngredientDrawSSuperLuck.ingredientDrawIngredients
      );

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
}
