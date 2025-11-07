import type { Berry } from '../berry/berry';
import type { ExpertModeSettings, ExpertRandomBonusType } from '../expert-mode';

export type IslandShortName = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'GGEX' | 'amber';
export interface Island {
  name: string;
  shortName: IslandShortName;
  berries: Berry[];
  expert: boolean;
}

export interface IslandInstance extends Island {
  areaBonus: number;
  expertMode?: ExpertModeSettings;
}

export interface TeamAreaDTO {
  islandName: IslandShortName;
  favoredBerries: string;
  expertModifier?: ExpertRandomBonusType;
}
