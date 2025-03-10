import { findIslandForName } from '@src/utils/island-utils/island-utils.js';
import type { Island } from 'sleepapi-common';
import { CYAN, ISLANDS } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('findIslandForName Function Tests', () => {
  it.each(ISLANDS)('finds existing island "%s"', (island: Island) => {
    const result = findIslandForName(island.name);
    expect(result).toEqual(island);
  });

  it('is case-insensitive when finding an island', () => {
    const testName = 'CyAn BeAcH';
    const result = findIslandForName(testName);
    expect(result).toEqual(CYAN);
  });

  it('shall return undefined for a non-existing island', () => {
    const result = findIslandForName('Nonexistent Island');
    expect(result).toBeUndefined();
  });

  it('shall return undefined for undefined input', () => {
    const result = findIslandForName(undefined);
    expect(result).toBeUndefined();
  });
});
