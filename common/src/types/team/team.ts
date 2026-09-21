import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { IslandInstance, IslandInstanceDto } from '../island';
import type { Time } from '../time/time';
import type { RecipeType } from '../recipe/recipe';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';

export type TeamScheduleType = 'time' | 'tasty-chance' | 'pot-size' | 'berry-zone' | 'ingredients';

export interface ScheduleIngredientThreshold {
  name: string;
  minimum: number;
  maximum: number;
}

/**
 * A recurring entry for one of the five visible team slots. Entries are
 * intentionally flat so existing persisted time schedules remain valid.
 */
export interface TeamScheduleShift {
  slotIndex: number;
  externalId: string;
  startTime: string;
  /** Missing on legacy schedules and therefore interpreted as `time`. */
  type?: TeamScheduleType;
  tastyChanceTarget?: number;
  potSizeTarget?: number;
  berryZoneTarget?: number;
  ingredientThresholds?: ScheduleIngredientThreshold[];
}

export interface TeamSettingsDto {
  recipeType?: RecipeType;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  island: IslandInstanceDto;
  stockpiledIngredients?: IngredientSetSimple[];
  schedule?: TeamScheduleShift[];
}
export interface TeamSettings {
  recipeType?: RecipeType;
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
  includeCooking: boolean;
  stockpiledIngredients: IngredientIndexToFloatAmount;
  potSize: number;
  island: IslandInstance;
  schedule?: TeamScheduleShift[];
}

export interface TeamSolution {
  members: TeamMemberWithProduce[];
  producedIngredients: IngredientSet[];
}

export type TeamResults = CalculateTeamResponse;

export interface SolveSettingsDto extends TeamSettingsDto {
  level: number;
}
export interface SolveSettings extends TeamSettings {
  level: number;
}
