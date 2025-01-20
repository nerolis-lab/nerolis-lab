export interface Ingredient {
  name: string;
  value: number;
  taxedValue: number;
  longName: string;
}
export interface IngredientSet {
  amount: number;
  ingredient: Ingredient;
}
export interface IngredientSetSimple {
  amount: number;
  ingredient: string;
}
export type IngredientIndexToIntAmount = Int16Array;
export type IngredientIndexToFloatAmount = Float32Array;
