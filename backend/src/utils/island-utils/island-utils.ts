import type { Island } from 'sleepapi-common';
import { ISLANDS } from 'sleepapi-common';

export function findIslandForName(islandName?: string): Island | undefined {
  return ISLANDS.find((island) => island.name.toLowerCase() === islandName?.toLowerCase());
}
