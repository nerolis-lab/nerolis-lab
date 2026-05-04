import type { Ingredient } from '../../../ingredient';
import { MOOMOO_MILK, ROUSING_COFFEE } from '../../../ingredient/ingredients';
import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { IngredientMagnetS } from './ingredient-magnet-s';

abstract class IngredientMagnetSPlus extends ModifiedMainskill {
  baseSkill = IngredientMagnetS;
  modifierName = 'Plus';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [5, 7, 9, 11, 13, 16, 18];

  abstract ingredient: Ingredient;
  abstract bonusIngredientAmounts: number[];

  image = 'ingredients';
  description = (params: AmountParams) => {
    const { skillLevel } = params;
    const baseAmount = this.ingredientAmounts[skillLevel - 1];
    const bonusAmount = this.bonusIngredientAmounts[skillLevel - 1];

    return (
      `Gets you ${baseAmount} ingredients chosen at random. ` +
      `Meet certain conditions to get an additional ${bonusAmount} ${this.ingredient.name}`
    );
  };
  fullDescription = (params: AmountParams) => {
    const { skillLevel } = params;
    const baseAmount = this.ingredientAmounts[skillLevel - 1];
    const bonusAmount = this.bonusIngredientAmounts[skillLevel - 1];

    return (
      `Gets you ${baseAmount} ingredients chosen at random. ` +
      `If there's one or more other Pokémon on the team with the Plus or Minus main skills, ` +
      `gets an additional ${this.ingredient.name} x ${bonusAmount}.`
    );
  };
}

export const IngredientMagnetSPlusPlusle = new (class extends IngredientMagnetSPlus {
  ingredient = ROUSING_COFFEE;
  bonusIngredientAmounts = [6, 7, 8, 9, 10, 11, 12];

  activations: ActivationsType = {
    solo: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    paired: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.bonusIngredientAmounts)
    }
  };
})(true);

export const IngredientMagnetSPlusToxtricity = new (class extends IngredientMagnetSPlus {
  ingredient = MOOMOO_MILK;
  bonusIngredientAmounts = [6, 7, 9, 10, 12, 13, 14];

  activations: ActivationsType = {
    solo: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    paired: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.bonusIngredientAmounts)
    }
  };
})(true);
