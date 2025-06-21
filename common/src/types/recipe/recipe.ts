import type { IngredientSet } from '../ingredient/ingredient';
import { CURRIES } from './curry';
import { DESSERTS } from './dessert';
import { SALADS } from './salad';

export interface Recipe {
  name: string;
  displayName: string;
  ingredients: IngredientSet[];
  value: number;
  valueMax: number;
  type: RecipeType;
  bonus: number;
  nrOfIngredients: number;
}

export interface RecipeFlat {
  name: string;
  displayName: string;
  ingredients: Float32Array;
  value: number;
  valueMax: number;
  type: RecipeType;
  bonus: number;
  nrOfIngredients: number;
}

export type RecipeType = 'curry' | 'salad' | 'dessert';

export const RECIPES = [...CURRIES, ...SALADS, ...DESSERTS];

export function getRecipe(name: string): Recipe {
  const recipe = RECIPES.find((r) => r.name === name);
  if (!recipe) {
    throw new Error(`Recipe not found: ${name}`);
  }
  return recipe;
}
