import type { RecipeFlat } from 'sleepapi-common';
import { curry, dessert, salad } from 'sleepapi-common';

export interface UserRecipes {
  curries: RecipeFlat[];
  salads: RecipeFlat[];
  desserts: RecipeFlat[];
}

export function defaultUserRecipes(): UserRecipes {
  return {
    curries: curry.CURRIES_FLAT.sort((a, b) => b.valueMax - a.valueMax),
    salads: salad.SALADS_FLAT.sort((a, b) => b.valueMax - a.valueMax),
    desserts: dessert.DESSERTS_FLAT.sort((a, b) => b.valueMax - a.valueMax)
  };
}
