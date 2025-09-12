import type { Berry } from '../berry/berry';
import type { ExpertRandomBonusType } from '../expert-mode';

export type IslandShortName = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'GGEX';
export interface Island {
  name: string;
  shortName: IslandShortName;
  berries: Berry[];
  expert: boolean;
}

export interface IslandInstance extends Island {
  areaBonus: number;
  expertModifier?: ExpertRandomBonusType;
}
