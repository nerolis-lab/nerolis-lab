import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import type { Mainskill } from 'sleepapi-common';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ING_ID_LOOKUP,
  ingredient,
  IngredientMagnetSPlusPlusle,
  IngredientMagnetSPlusToxtricity,
  isPlusOrMinus
} from 'sleepapi-common';

abstract class IngredientMagnetSPlusEffect implements SkillEffect {
  abstract skill: Mainskill;
  activate(skillState: SkillState): SkillActivation {
    const ingMagnetAmount = skillState.skillAmount(this.skill.activations.solo);

    const flatIngredients = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS
    );

    const bonusAmount =
      skillState.memberState.otherMembers.filter((member) => isPlusOrMinus(member.skill)).length === 0
        ? 0
        : skillState.skillAmount(this.skill.activations.paired, {
            ingredient: skillState.memberState.member.pokemonWithIngredients.ingredientList[0].ingredient
          });
    flatIngredients[
      ING_ID_LOOKUP[skillState.memberState.member.pokemonWithIngredients.ingredientList[0].ingredient.name]
    ] += bonusAmount;

    const ingredients = flatToIngredientSet(flatIngredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);

    skillState.memberState.addSkillProduce({ berries: [], ingredients });

    return {
      skill: this.skill,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingMagnetAmount, crit: bonusAmount }
        }
      ]
    };
  }
}

export class IngredientMagnetSPlusPlusleEffect extends IngredientMagnetSPlusEffect {
  skill = IngredientMagnetSPlusPlusle;
}

export class IngredientMagnetSPlusToxtricityEffect extends IngredientMagnetSPlusEffect {
  skill = IngredientMagnetSPlusToxtricity;
}
