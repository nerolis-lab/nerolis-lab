import type {
  IngredientProducers,
  IngredientProducersWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { IngredientIndexToIntAmount, SolveSettingsExt, TeamMemberExt } from 'sleepapi-common';

export interface SolveRecipeInput {
  includedMembers: TeamMemberExt[];
  solveSettings: SolveSettingsExt;
  maxTeamSize: number;
}

export interface SubRecipeMeta {
  remainingRecipeWithSpotsLeft: IngredientIndexToIntAmount;
  remainingIngredientIndices: number[];
  sumRemainingRecipeIngredients: number;
  member: number;
}

// an array of solutions containing an array of each member's index in producer array
export type RecipeSolutions = Array<Array<number>>;

export interface SolveRecipeSolution {
  members: IngredientProducers;
  producedIngredients: IngredientIndexToIntAmount;
}
export interface SolveRecipeSolutionWithSettings {
  members: IngredientProducersWithSettings;
  producedIngredients: IngredientIndexToIntAmount;
}

export interface SolveRecipeResult {
  teams: SolveRecipeSolution[];
  exhaustive: boolean;
}
export interface SolveRecipeResultWithSettings {
  teams: SolveRecipeSolutionWithSettings[];
  exhaustive: boolean;
}
