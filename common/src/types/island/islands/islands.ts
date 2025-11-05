import type { IslandShortName } from '../island';
import { AMBER } from './amber';
import { CYAN } from './cyan';
import { GREENGRASS, GREENGRASS_EXPERT } from './greengrass';
import { LAPIS } from './lapis';
import { POWER_PLANT } from './powerplant';
import { SNOWDROP } from './snowdrop';
import { TAUPE } from './taupe';

export const ISLANDS = [GREENGRASS, CYAN, TAUPE, SNOWDROP, LAPIS, POWER_PLANT, AMBER];
export const EXPERT_ISLANDS = [GREENGRASS_EXPERT];

// Mapping from base islands to their expert versions
export const BASE_TO_EXPERT_MAP: Partial<Record<IslandShortName, IslandShortName>> = {
  greengrass: 'GGEX'
};
