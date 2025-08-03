import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { Time } from '../time/time';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
  stockpiledIngredients?: IngredientSetSimple[];
  externalE4eProcs?: number;
}
export interface TeamSettingsExt {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
  includeCooking: boolean;
  stockpiledIngredients: IngredientIndexToFloatAmount;
  potSize: number;
  externalE4eProcs?: number;
}

export interface TeamSolution {
  members: TeamMemberWithProduce[];
  producedIngredients: IngredientSet[];
}

export type TeamResults = CalculateTeamResponse;

export interface SolveSettings extends TeamSettings {
  level: number;
}
export interface SolveSettingsExt extends TeamSettingsExt {
  level: number;
}
