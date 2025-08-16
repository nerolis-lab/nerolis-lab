import type { Berry } from '../berry';

/**
 * One additional bonus related to raising Snorlax will be selected at random every week
 */
export type ExpertRandomBonusType = 'ingredient' | 'berry' | 'skill';

export interface ExpertModeSettings {
  mainFavoriteBerry: string;
  subFavoriteBerries: string[];
  randomBonus: ExpertRandomBonusType;
}

export interface ExpertModeSettingsExt {
  mainFavoriteBerry: Berry;
  subFavoriteBerries: Berry[];
  randomBonus: ExpertRandomBonusType;
}
