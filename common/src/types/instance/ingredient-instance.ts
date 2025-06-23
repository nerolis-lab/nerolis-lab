import type { Ingredient } from '../ingredient/ingredient';

export interface IngredientInstance {
  level: number;
  amount: number;
  name: string;
}

export interface IngredientInstanceExt {
  level: number;
  amount: number;
  ingredient: Ingredient;
}
