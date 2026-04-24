import { BELUE, BLUK, GREPA } from '../../../types/berry/berries';
import type { ExpertModeSettings, Island, IslandInstance, TeamAreaDTO } from '../../../types';

export function island(attrs?: Partial<Island>): Island {
  return {
    name: 'Mock Island',
    berries: [],
    shortName: 'greengrass',
    expert: false,
    ...attrs
  };
}

export function islandInstance(attrs?: Partial<IslandInstance>): IslandInstance {
  return {
    ...island(),
    areaBonus: 0,
    ...attrs
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
