import type { IslandShortName } from '../../types';
import { GREENGRASS, ISLANDS, type Berry, type Island } from '../../types';

export const DEFAULT_ISLAND = { ...GREENGRASS, areaBonus: 0 };

export function getIsland(name: IslandShortName): Island;
export function getIsland(favoredBerries: Berry[]): Island;
export function getIsland(nameOrBerries: IslandShortName | Berry[]): Island {
  if (typeof nameOrBerries === 'string') {
    return ISLANDS.find((island) => island.shortName.toLowerCase() === nameOrBerries.toLowerCase()) ?? GREENGRASS;
  }

  if (nameOrBerries.length === 0) {
    return GREENGRASS;
  }

  const berryNames = nameOrBerries.map((b) => b.name);
  const containsAll = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value) => arr2.includes(value));
  };

  for (const islnd of ISLANDS) {
    const islandBerryNames = islnd.berries.map((b) => b.name);
    if (containsAll(islandBerryNames, berryNames)) {
      return islnd;
    }
  }

  return GREENGRASS;
}
