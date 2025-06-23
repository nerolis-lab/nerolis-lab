import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { RecipeType } from '../recipe/recipe';

export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  favoredBerries?: string[];
  stockpiledIngredients?: IngredientSetSimple[];
  stockpiledBerries?: BerrySetSimple[];
}

export interface UpsertTeamMetaResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  version: number;
  recipeType: RecipeType;
  favoredBerries?: string[];
  stockpiledIngredients?: IngredientSetSimple[];
  stockpiledBerries?: BerrySetSimple[];
}
