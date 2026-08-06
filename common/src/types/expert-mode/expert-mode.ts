import type { FunctionalEvent } from '../../events';
import type { Berry } from '../berry';

/**
 * One additional bonus related to raising Snorlax will be selected at random every week
 */
export type ExpertRandomBonusType = 'ingredient' | 'berry' | 'skill';

export const MAX_SUB_FAVORITE_BERRIES = 2;

export type ExpertModeBonuses = (input: ExpertModeSettings) => FunctionalEvent;

export interface ExpertModeSettingsDTO {
  mainFavoriteBerry: string;
  subFavoriteBerries: string[];
  randomBonus: ExpertRandomBonusType;
}

export interface ExpertModeSettings {
  mainFavoriteBerry: Berry;
  subFavoriteBerries: Berry[];
  randomBonus: ExpertRandomBonusType;
}
