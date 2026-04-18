import type { Berry } from '../berry/berry';
import type { ExpertModeSettings, ExpertRandomBonusType } from '../expert-mode';

export type IslandShortName = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'GGEX' | 'amber';

export interface Island {
  name: string;
  shortName: IslandShortName;
  berries: Berry[];
  expert: false;
}

export interface ExpertIsland {
  name: string;
  shortName: IslandShortName;
  berries: Berry[];
  expert: true;
  base: Island;
}

/**
 * Discriminated union of base and expert islands. Narrow via the `expert` property.
 */
export type Area = Island | ExpertIsland;

export type BaseIslandInstance = Island & {
  areaBonus: number;
  expertMode?: undefined;
  base?: undefined;
};
export type ExpertIslandInstance = ExpertIsland & {
  areaBonus: number;
  expertMode?: ExpertModeSettings;
};

/**
 * Runtime island instance, either base or expert. Narrow via the `expert` property.
 */
export type IslandInstance = BaseIslandInstance | ExpertIslandInstance;

/**
 * Factory for expert island definitions. Derives `name` from the base island as
 * `${base.name} (Expert Mode)` unless an override is supplied.
 */
export function createExpertIsland(
  base: Island,
  overrides: Partial<Omit<ExpertIsland, 'expert' | 'base'>> & Pick<ExpertIsland, 'shortName'>
): ExpertIsland {
  return {
    name: `${base.name} (Expert Mode)`,
    berries: [],
    ...overrides,
    expert: true,
    base
  };
}

export interface TeamAreaDTO {
  islandName: IslandShortName;
  favoredBerries: string;
  expertModifier?: ExpertRandomBonusType;
  mainFavoriteBerry?: string;
  subFavoriteBerries?: string;
}
