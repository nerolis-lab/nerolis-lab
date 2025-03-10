import type { Berry, Island } from 'sleepapi-common';
import { berry, CYAN, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from 'sleepapi-common';

export function getBerriesForFilter(islands: {
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  powerplant: boolean;
}) {
  const { cyan, taupe, snowdrop, lapis, powerplant } = islands;

  const cyanBerries = cyan ? CYAN.berries : [];
  const taupeBerries = taupe ? TAUPE.berries : [];
  const snowdropBerries = snowdrop ? SNOWDROP.berries : [];
  const lapisBerries = lapis ? LAPIS.berries : [];
  const powerplantBerries = powerplant ? POWER_PLANT.berries : [];

  return cyan || taupe || snowdrop || lapis || powerplant
    ? [...cyanBerries, ...taupeBerries, ...snowdropBerries, ...lapisBerries, ...powerplantBerries]
    : berry.BERRIES;
}

export function getBerriesForIsland(island?: Island): Berry[] {
  return island?.berries ?? berry.BERRIES;
}
