import { describe, expect, it } from 'vitest';
import { CookingAssistS } from './cooking-assist-s';

describe('CookingAssistS', () => {
  it('should have correct basic properties', () => {
    expect(CookingAssistS.name).toBe('Cooking Assist S');
    expect(CookingAssistS.description({ skillLevel: 1 })).toBe('Gets you 6 ingredients chosen at random.');
    expect(CookingAssistS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(CookingAssistS.maxLevel).toBe(7);
  });

  it('should have ingredient activation', () => {
    expect(CookingAssistS.activations).toHaveProperty('ingredients');
    expect(CookingAssistS.activations.ingredients.unit).toBe('ingredients');
    expect(typeof CookingAssistS.activations.ingredients.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = CookingAssistS.activations.ingredients.amount({ skillLevel: 1 });
    const level6Amount = CookingAssistS.activations.ingredients.amount({ skillLevel: 6 });

    expect(level1Amount).toBe(6);
    expect(level6Amount).toBe(21);
  });

  it('should have ingredients unit only', () => {
    expect(CookingAssistS.hasUnit('ingredients')).toBe(true);
    expect(CookingAssistS.hasUnit('energy')).toBe(false);
    expect(CookingAssistS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(CookingAssistS.getRPValue(1)).toBe(880);
    expect(CookingAssistS.getRPValue(3)).toBe(1726);
    expect(CookingAssistS.getRPValue(6)).toBe(4546);
  });
});
