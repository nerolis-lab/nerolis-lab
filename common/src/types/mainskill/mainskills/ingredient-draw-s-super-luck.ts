import type { AmountFunction, Ingredient, MainskillUnit } from '../..';
import { rollToOutput } from '../../../utils/mainskill-utils/mainskill-utils';
import { BEAN_SAUSAGE, GREENGRASS_SOYBEANS, ROUSING_COFFEE, TASTY_MUSHROOM } from '../../ingredient/ingredients';
import { ModifiedMainskill, ZeroAmount } from '../mainskill';
import { IngredientDrawS } from './ingredient-draw-s';

class IngredientDrawSSuperLuckImpl extends ModifiedMainskill {
  baseSkill = IngredientDrawS;
  modifierName = 'Super Luck';
  // TODO: is RP sheet off? It has 4846 instead of 4546
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [5, 6, 8, 11, 13, 16, 18];
  dreamShardAmounts = [500, 720, 1030, 1440, 2000, 2800, 4000];
  critDreamShardAmounts = [2500, 3600, 5150, 7200, 10000, 14000, 20000];
  image = 'ingredient_draw';

  description = (skillLevel: number) =>
    `Gets ${this.ingredientAmounts[skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients. On rare occasions, gets a great number of Dream Shards instead.`;

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

  SuperLuckProbabilities: Record<SuperLuckOutput, number> = {
    Mushroom: 20,
    Sausage: 22,
    Soybeans: 20,
    Coffee: 22,
    'Dream Shards (S)': 13,
    'Dream Shards (L)': 3
  };

  SuperLuckResultConfig: Record<SuperLuckOutput, SuperLuckResult> = {
    Mushroom: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: TASTY_MUSHROOM,
      unit: 'ingredients'
    },
    Sausage: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: BEAN_SAUSAGE,
      unit: 'ingredients'
    },
    Soybeans: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: GREENGRASS_SOYBEANS,
      unit: 'ingredients'
    },
    Coffee: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: ROUSING_COFFEE,
      unit: 'ingredients'
    },
    'Dream Shards (S)': {
      amountFunc: this.activations.dreamShards.amount,
      critAmountFunc: ZeroAmount,
      ingredient: undefined,
      unit: 'dream shards'
    },
    'Dream Shards (L)': {
      amountFunc: ZeroAmount,
      critAmountFunc: this.activations.dreamShards.critAmount,
      ingredient: undefined,
      unit: 'dream shards'
    }
  };

  rollToResult(roll: number): SuperLuckResult {
    return this.SuperLuckResultConfig[rollToOutput(roll, this.SuperLuckProbabilities)];
  }
}

export type SuperLuckOutput = 'Mushroom' | 'Sausage' | 'Soybeans' | 'Coffee' | 'Dream Shards (S)' | 'Dream Shards (L)';

export interface SuperLuckResult {
  amountFunc: AmountFunction;
  critAmountFunc: AmountFunction;
  ingredient: Ingredient | undefined;
  unit: MainskillUnit;
}

export const IngredientDrawSSuperLuck = new IngredientDrawSSuperLuckImpl();
