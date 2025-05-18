import type { Ingredient } from '../..';
import { BEAN_SAUSAGE, GREENGRASS_SOYBEANS, ROUSING_COFFEE, TASTY_MUSHROOM } from '../../ingredient/ingredients';
import { ModifiedMainskill } from '../mainskill';
import { IngredientDrawS } from './ingredient-draw-s';

export const IngredientDrawSSuperLuck = new (class extends ModifiedMainskill {
  baseSkill = IngredientDrawS;
  modifierName = 'Super Luck';
  RP = [880, 1251, 1726, 2383, 3290, 4846, 5843];
  ingredientAmounts = [5, 6, 8, 11, 13, 16, 18];
  dreamShardAmounts = [500, 720, 1030, 1440, 2000, 2800, 4000];
  critDreamShardAmounts = [2500, 3600, 5150, 7200, 10000, 14000, 20000];
  image = 'ingredient_draw';

  description = (skillLevel: number) =>
    `Gets ${this.ingredientAmounts[skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients. On rare occasions, gets a great number of Dream Shards instead.`;

  critChance = 0.16;
  superCritChance = 0.04;

  activations = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    dreamShards: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.dreamShardAmounts),
      critAmount: this.leveledAmount(this.critDreamShardAmounts)
    }
  };

  get ingredientDrawIngredients(): Ingredient[] {
    return [BEAN_SAUSAGE, GREENGRASS_SOYBEANS, TASTY_MUSHROOM, ROUSING_COFFEE];
  }
})();
