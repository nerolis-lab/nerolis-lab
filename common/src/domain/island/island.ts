import type { Berry } from '../berry/berry';

export type IslandShortName = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant';
export interface Island {
  name: string;
  shortName: IslandShortName;
  berries: Berry[];
}
