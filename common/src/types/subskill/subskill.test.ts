import { describe, expect, it } from 'vitest';
import type { Subskill } from './subskill';
import * as SubskillModule from './subskills';

describe('SUBSKILLS array', () => {
  it('should include all dynamically defined subskills in the SUBSKILLS array', () => {
    // Dynamically extract all constants that are Subskill objects
    const allSubskills = Object.values(SubskillModule).filter(
      (value): value is Subskill =>
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        'shortName' in value &&
        'amount' in value &&
        'rarity' in value
    );

    allSubskills.forEach((subskill) => {
      expect(SubskillModule.SUBSKILLS).toContainEqual(subskill);
    });
  });
});
