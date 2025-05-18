import type { IngredientSet } from '../../types/ingredient/ingredient';
import type { TeamMember } from '../../types/team/member';
import type { SolveSettings, TeamSolution } from '../../types/team/team';

export interface SolveRecipeRequest {
  settings: SolveSettings;
  includedMembers?: TeamMember[];
  maxTeamSize?: number;
}

export interface SurplusIngredients {
  total: IngredientSet[];
  relevant: IngredientSet[];
  extra: IngredientSet[];
}

export interface RecipeTeamSolution extends TeamSolution {
  surplus: SurplusIngredients;
}

export interface SolveRecipeResponse {
  teams: RecipeTeamSolution[];
  exhaustive: boolean;
}
