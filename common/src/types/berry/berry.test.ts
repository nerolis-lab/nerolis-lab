import { describe, expect, it } from 'vitest';
import * as BerryModule from './berries';
import type { Berry } from './berry';

describe('BERRIES array', () => {
  it('should include all dynamically defined berries in the BERRIES array', () => {
    // Dynamically extract all constants that are Ingredient objects
    const allBerries = Object.values(BerryModule).filter(
      (value): value is Berry =>
        typeof value === 'object' && value !== null && 'name' in value && 'value' in value && 'type' in value
    );

    allBerries.forEach((berry) => {
      expect(BerryModule.BERRIES).toContainEqual(berry);
    });
  });
});
