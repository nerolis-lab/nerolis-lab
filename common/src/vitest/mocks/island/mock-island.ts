import type { Island, IslandInstance } from '../../../types';

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
