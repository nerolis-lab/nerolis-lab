import type { Ingredient } from '../../ingredient';
import { BEAN_SAUSAGE, GREENGRASS_SOYBEANS, ROUSING_COFFEE, TASTY_MUSHROOM } from '../../ingredient/ingredients';
import { Mainskill } from '../mainskill';

export const IngredientDrawS = new (class extends Mainskill {
  name = 'Ingredient Draw S';
  RP = [880, 1251, 1726, 2383, 3290, 4846, 5843];
  ingredientAmounts = [6, 8, 11, 14, 17, 21, 24];
  image = 'ingredient_draw';
  description = (skillLevel: number) =>
    `Gets ${this.ingredientAmounts[skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients.`;
  activations = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    }
  };

  get ingredientDrawIngredients(): Ingredient[] {
    return [BEAN_SAUSAGE, GREENGRASS_SOYBEANS, TASTY_MUSHROOM, ROUSING_COFFEE];
  }
})();
