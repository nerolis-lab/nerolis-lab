import { BELUE, BLUK, GREPA } from '../../../types/berry/berries';
import type {
  ExpertIsland,
  ExpertIslandInstance,
  ExpertModeSettings,
  Island,
  IslandInstance,
  TeamAreaDTO
} from '../../../types';
import { GREENGRASS } from '../../../types';

export function island(attrs?: Partial<Omit<Island, 'expert'>>): Island {
  return {
    name: 'Mock Island',
    berries: [],
    shortName: 'greengrass',
    ...attrs,
    expert: false
  };
}

export function expertIsland(attrs?: Partial<Omit<ExpertIsland, 'expert'>>): ExpertIsland {
  return {
    name: 'Mock Island (Expert Mode)',
    berries: [],
    shortName: 'GGEX',
    base: GREENGRASS,
    ...attrs,
    expert: true
  };
}

type BaseIslandInstanceInput = Partial<Omit<Island, 'expert'>> & {
  expert?: false;
  areaBonus?: number;
};

type ExpertIslandInstanceInput = Partial<Omit<ExpertIsland, 'expert' | 'base'>> & {
  expert: true;
  base?: Island;
  areaBonus?: number;
  expertMode?: ExpertModeSettings;
};

type IslandInstanceInput = BaseIslandInstanceInput | ExpertIslandInstanceInput;

export function islandInstance(attrs?: IslandInstanceInput): IslandInstance {
  if (attrs?.expert === true) {
    return {
      ...expertIsland({ base: attrs.base ?? GREENGRASS }),
      areaBonus: 0,
      ...attrs,
      base: attrs.base ?? GREENGRASS
    };
  }
  return {
    ...island(),
    areaBonus: 0,
    ...attrs
  };
}

export function expertIslandInstance(attrs?: Partial<Omit<ExpertIslandInstance, 'expert'>>): ExpertIslandInstance {
  return {
    ...expertIsland({ base: attrs?.base, shortName: attrs?.shortName, name: attrs?.name, berries: attrs?.berries }),
    areaBonus: 0,
    ...attrs,
    expert: true,
    base: attrs?.base ?? GREENGRASS
  };
}

export function islandDTO(attrs?: Partial<TeamAreaDTO>): TeamAreaDTO {
  return {
    islandName: 'greengrass',
    favoredBerries: '',
    ...attrs
  };
}

export function expertModeSettings(attrs?: Partial<ExpertModeSettings>): ExpertModeSettings {
  return {
    mainFavoriteBerry: BELUE,
    subFavoriteBerries: [GREPA, BLUK],
    randomBonus: 'ingredient',
    ...attrs
  };
}

export function expertIslandDTO(attrs?: Partial<TeamAreaDTO>): TeamAreaDTO {
  return {
    islandName: 'GGEX',
    favoredBerries: 'BELUE',
    expertModifier: 'ingredient',
    mainFavoriteBerry: 'BELUE',
    subFavoriteBerries: 'GREPA,BLUK',
    ...attrs
  };
}
