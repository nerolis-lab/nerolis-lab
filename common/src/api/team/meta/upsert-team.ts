import type { BerrySetSimple, IngredientSetSimple } from '../../../domain';
import type { RecipeType } from '../../../domain/recipe/recipe';

export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  favoredBerries?: string[];
  stockpiledIngredients?: IngredientSetSimple[];
  stockpiledBerries?: BerrySetSimple[];
  excludedIngredients?: string[];
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
  excludedIngredients?: string[];
}
