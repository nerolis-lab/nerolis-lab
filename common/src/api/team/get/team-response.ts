import type { BerrySetSimple, IngredientSetSimple } from '../../../domain';
import type { RecipeType } from '../../../domain/recipe/recipe';
import type { MemberInstance } from './member-instance';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  favoredBerries?: string[];
  stockpiledBerries?: BerrySetSimple[];
  stockpiledIngredients?: IngredientSetSimple[];
  excludedIngredients?: string[];
  version: number;

  members: MemberInstance[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
