import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';

abstract class IngredientDrawS extends Mainskill {
  name = 'Ingredient Draw S';
  RP = [880, 1251, 1726, 2383, 3290, 4846, 5843];
  ingredientAmounts = [5, 6, 8, 11, 13, 16, 18];
  image = 'ingredient_draw';
  description = (params: AmountParams) =>
    `Gets ${this.ingredientAmounts[params.skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients.`;
  activations: ActivationsType = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    }
  };
}

export const IngredientDrawSSandshrew = new (class extends IngredientDrawS {})();
export const IngredientDrawSDwebble = new (class extends IngredientDrawS {})();
export const IngredientDrawSCutiefly = new (class extends IngredientDrawS {})();
