import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { Island } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { MemberInstance } from './member-instance';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  island?: Island;
  stockpiledBerries?: BerrySetSimple[];
  stockpiledIngredients?: IngredientSetSimple[];
  version: number;

  members: MemberInstance[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
