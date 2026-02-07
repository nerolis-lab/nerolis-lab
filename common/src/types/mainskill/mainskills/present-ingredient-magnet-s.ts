import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { IngredientMagnetS } from './ingredient-magnet-s';

export const PresentIngredientMagnetS = new (class extends ModifiedMainskill {
  baseSkill = IngredientMagnetS;
  modifierName = 'Present';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [4, 6, 8, 10, 12, 15, 17];
  candyAmount = 4;
  candyChance = 1 / 3;
  image = 'ingredients';
  description = (params: AmountParams) =>
    `Gets you ${this.ingredientAmounts[params.skillLevel - 1]} ingredients chosen at random. Sometimes gets an additional ${this.candyAmount} candy for one Pokémon on your team.`;

  activations = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    candy: {
      unit: 'candy',
      amount: () => this.candyAmount
    }
  };
})();
