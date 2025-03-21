import type { RecipeType } from '../../../domain/recipe/recipe';
import type { IngredientSetSimple } from '../../../domain/ingredient/ingredient';
import type { BerrySetSimple } from '../../../domain/berry/berry';
import type { TeamMemberExt } from '../../../domain/team/member';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  favoredBerries: string[];
  stockpiledIngredients: IngredientSetSimple[];
  stockpiledBerries: BerrySetSimple[];
  excludedIngredients: string[];
  version: number;
  members: TeamMemberExt[];
}
