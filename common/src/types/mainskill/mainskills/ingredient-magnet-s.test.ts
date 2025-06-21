import { describe, expect, it } from 'vitest';
import { IngredientMagnetS } from './ingredient-magnet-s';

describe('IngredientMagnetS', () => {
  it('should have correct basic properties', () => {
    expect(IngredientMagnetS.name).toBe('Ingredient Magnet S');
    expect(IngredientMagnetS.description(1)).toBe('Gets you 6 ingredients chosen at random.');
    expect(IngredientMagnetS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(IngredientMagnetS.maxLevel).toBe(7);
  });

  it('should have ingredient activation', () => {
    expect(IngredientMagnetS.activations).toHaveProperty('ingredients');
    expect(IngredientMagnetS.activations.ingredients.unit).toBe('ingredients');
    expect(typeof IngredientMagnetS.activations.ingredients.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = IngredientMagnetS.activations.ingredients.amount(1);
    const level6Amount = IngredientMagnetS.activations.ingredients.amount(6);

    expect(level1Amount).toBe(6);
    expect(level6Amount).toBe(21);
  });

  it('should have ingredients unit only', () => {
    expect(IngredientMagnetS.hasUnit('ingredients')).toBe(true);
    expect(IngredientMagnetS.hasUnit('energy')).toBe(false);
    expect(IngredientMagnetS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(IngredientMagnetS.getRPValue(1)).toBe(880);
    expect(IngredientMagnetS.getRPValue(3)).toBe(1726);
    expect(IngredientMagnetS.getRPValue(6)).toBe(4546);
  });
});
