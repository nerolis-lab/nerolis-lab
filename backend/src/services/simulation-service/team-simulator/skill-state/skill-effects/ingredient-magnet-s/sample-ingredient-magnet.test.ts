import { describe, expect, it } from 'vitest';
import { sampleIngredientMagnet } from './sample-ingredient-magnet.js';
import { ingredient } from 'sleepapi-common';

describe('sampleIngredientMagnet', () => {
  it.each([5, 6, 7, 8, 9, 11, 14, 17, 21, 24])(
    'preserves the total of %i with three distinct integer drops',
    (amount) => {
      const result = sampleIngredientMagnet(amount, () => 0);
      const drops = Array.from(result).filter((value) => value > 0);
      expect(drops).toHaveLength(3);
      expect(drops.reduce((sum, value) => sum + value, 0)).toBe(amount);
      expect(drops.every(Number.isInteger)).toBe(true);
      expect(Math.max(...drops) - Math.min(...drops)).toBeLessThanOrEqual(1);
    }
  );

  it('can select the last ingredient without repeating a type', () => {
    const result = sampleIngredientMagnet(24, () => 0.99999);
    expect(Array.from(result).slice(-3)).toEqual([8, 8, 8]);
    expect(result.length).toBe(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
  });
});
