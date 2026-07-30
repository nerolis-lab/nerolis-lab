import { CYAN, GREENGRASS, GREENGRASS_EXPERT, ISLANDS } from '../../types';
import { defaultIslandBerries, getIsland, hasCustomBerries } from './island-utils';

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

describe('defaultIslandBerries', () => {
  it('returns the fixed berries for a base island', () => {
    expect(defaultIslandBerries(CYAN.shortName)).toEqual(CYAN.berries);
  });

  it('returns an empty array for Greengrass', () => {
    expect(defaultIslandBerries(GREENGRASS.shortName)).toEqual([]);
  });

  it('returns an empty array for an expert island shortName', () => {
    expect(defaultIslandBerries(GREENGRASS_EXPERT.shortName)).toEqual([]);
  });
});

describe('hasCustomBerries', () => {
  it('is false when a base island matches its default berries', () => {
    expect(hasCustomBerries({ ...CYAN, areaBonus: 0 })).toBe(false);
  });

  it('is true when a base island differs from its default berries', () => {
    expect(hasCustomBerries({ ...CYAN, areaBonus: 0, berries: [] })).toBe(true);
  });

  it('is false for Greengrass regardless of berries, since it has no fixed default', () => {
    expect(hasCustomBerries({ ...GREENGRASS, areaBonus: 0, berries: [CYAN.berries[0]] })).toBe(false);
  });

  it('is false for expert islands', () => {
    expect(hasCustomBerries({ ...GREENGRASS_EXPERT, areaBonus: 0, berries: [] })).toBe(false);
  });
});
