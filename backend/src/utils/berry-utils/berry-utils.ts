import type { Berry, Island } from 'sleepapi-common';
import { AMBER, berry, CYAN, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from 'sleepapi-common';

export function getBerriesForFilter(islands: {
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  powerplant: boolean;
  amber: boolean;
}) {
  const { cyan, taupe, snowdrop, lapis, powerplant, amber } = islands;

  const cyanBerries = cyan ? CYAN.berries : [];
  const taupeBerries = taupe ? TAUPE.berries : [];
  const snowdropBerries = snowdrop ? SNOWDROP.berries : [];
  const lapisBerries = lapis ? LAPIS.berries : [];
  const powerplantBerries = powerplant ? POWER_PLANT.berries : [];
  const amberBerries = amber ? AMBER.berries : [];

  return cyan || taupe || snowdrop || lapis || powerplant || amber
    ? [...cyanBerries, ...taupeBerries, ...snowdropBerries, ...lapisBerries, ...powerplantBerries, ...amberBerries]
    : berry.BERRIES;
}

export function getBerriesForIsland(island?: Island): Berry[] {
  return island?.berries ?? berry.BERRIES;
}
