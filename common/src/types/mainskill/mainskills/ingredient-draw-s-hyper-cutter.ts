import type { Ingredient } from '../..';
import { GREENGRASS_CORN, PURE_OIL, SNOOZY_TOMATO, SOFT_POTATO } from '../../ingredient/ingredients';
import { ModifiedMainskill } from '../mainskill';
import { IngredientDrawS } from './ingredient-draw-s';

export const IngredientDrawSHyperCutter = new (class extends ModifiedMainskill {
  baseSkill = IngredientDrawS;
  modifierName = 'Hyper Cutter';
  RP = [880, 1251, 1726, 2383, 3290, 4846, 5843];
  ingredientAmounts = [5, 6, 8, 11, 13, 16, 18];
  critIngredientAmounts = this.ingredientAmounts.map((normalAmount) => normalAmount * 2);
  image = 'ingredient_draw';

  description = (skillLevel: number) =>
    `Gets ${this.ingredientAmounts[skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients. On rare occasions, gets twice as many ingredients.`;

  critChance = 0.16;

  activations = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts),
      critAmount: this.leveledAmount(this.critIngredientAmounts)
    }
  };

  get ingredientDrawIngredients(): Ingredient[] {
    return [SOFT_POTATO, PURE_OIL, SNOOZY_TOMATO, GREENGRASS_CORN];
  }
})();
