import type { RecipeFlat } from 'sleepapi-common';
import { curry, dessert, salad } from 'sleepapi-common';

export type UserRecipeFlat = RecipeFlat & { level: number };
export interface UserRecipes {
  curries: UserRecipeFlat[];
  salads: UserRecipeFlat[];
  desserts: UserRecipeFlat[];
}

export function defaultUserRecipes(): UserRecipes {
  return {
    curries: sortByMaxLevel(curry.CURRIES_FLAT),
    salads: sortByMaxLevel(salad.SALADS_FLAT),
    desserts: sortByMaxLevel(dessert.DESSERTS_FLAT)
  };
}

function sortByMaxLevel(recipes: RecipeFlat[]): UserRecipeFlat[] {
  return recipes.map((recipe) => ({ ...recipe, level: 60 })).sort((a, b) => b.valueMax - a.valueMax);
}
