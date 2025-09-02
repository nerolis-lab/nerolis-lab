import { CYAN, GREENGRASS, ISLANDS } from '../../types';
import { getIsland } from './island-utils';

describe('getIsland', () => {
  it('should return GREENGRASS when favoredBerries is null/undefined', () => {
    expect(getIsland([])).toBe(GREENGRASS);
  });

  it('should return GREENGRASS when no island matches the berries', () => {
    const randomBerries = [CYAN.berries[0]]; // Just one berry won't match any island
    expect(getIsland(randomBerries)).toBe(GREENGRASS);
  });

  it('should return correct island when berries match', () => {
    for (const island of ISLANDS) {
      expect(getIsland(island.berries)).toBe(island);
    }
  });

  it('should return correct island when name matches', () => {
    for (const island of ISLANDS) {
      expect(getIsland(island.shortName)).toBe(island);
    }
  });

  it('should match islands even if berries are in different order', () => {
    for (const island of ISLANDS) {
      const shuffledBerries = [...island.berries].reverse();
      expect(getIsland(shuffledBerries)).toBe(island);
    }
  });
});
