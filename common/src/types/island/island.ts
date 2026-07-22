import type { Berry } from '../berry/berry';
import type { ExpertModeSettings, ExpertRandomBonusType } from '../expert-mode';

export type IslandShortName =
  'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'GGEX' | 'CBEX' | 'amber';

interface IslandBase {
  name: string;
  shortName: IslandShortName;
}

export interface Island extends IslandBase {
  berries: Berry[];
  expert: false;
}

// An expert island definition has no fixed favorite berries
export interface ExpertIsland extends IslandBase {
  expert: true;
  base: Island;
}

// Discriminated union of base and expert islands. Narrow via the `expert` property.
export type Area = Island | ExpertIsland;

export type BaseIslandInstance = Island & {
  areaBonus: number;
  expertMode?: undefined;
  base?: undefined;
};
export type ExpertIslandInstance = ExpertIsland & {
  areaBonus: number;
  berries: Berry[];
  expertMode?: ExpertModeSettings;
};

// Runtime island instance, either base or expert. Narrow via the `expert` property.
export type IslandInstance = BaseIslandInstance | ExpertIslandInstance;

/**
 * Factory for expert island definitions. Derives `name` from the base island as
 * `${base.name} (Expert Mode)` unless an override is supplied.
 */
export function createExpertIsland(
  base: Island,
  overrides: { name?: string; shortName: IslandShortName }
): ExpertIsland {
  return {
    name: `${base.name} (Expert Mode)`,
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
