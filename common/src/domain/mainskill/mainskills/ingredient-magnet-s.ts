import { Mainskill } from '../mainskill';

export const IngredientMagnetS = new (class extends Mainskill {
  name = 'Ingredient Magnet S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [6, 8, 11, 14, 17, 21, 24];
  image = 'ingredients';
  description = (skillLevel: number) =>
    `Gets you ${this.ingredientAmounts[skillLevel - 1]} ingredients chosen at random.`;
  activations = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    }
  };
})();
