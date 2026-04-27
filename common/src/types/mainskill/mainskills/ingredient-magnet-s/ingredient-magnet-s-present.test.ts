import { describe, expect, it } from 'vitest';
import { IngredientMagnetS } from './ingredient-magnet-s';
import { IngredientMagnetSPresent } from './ingredient-magnet-s-present';

describe('IngredientMagnetSPresent', () => {
  it('should have correct basic properties', () => {
    expect(IngredientMagnetSPresent.name).toBe('Present (Ingredient Magnet S)');
    expect(IngredientMagnetSPresent.baseSkill).toBe(IngredientMagnetS);
    expect(IngredientMagnetSPresent.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(IngredientMagnetSPresent.maxLevel).toBe(7);
  });

  it('should have ingredient and candy activations', () => {
    expect(IngredientMagnetSPresent.activations).toHaveProperty('ingredients');
    expect(IngredientMagnetSPresent.activations).toHaveProperty('candy');
    expect(IngredientMagnetSPresent.activations.ingredients.unit).toBe('ingredients');
    expect(IngredientMagnetSPresent.activations.candy.unit).toBe('candy');
    expect(typeof IngredientMagnetSPresent.activations.ingredients.amount).toBe('function');
    expect(typeof IngredientMagnetSPresent.activations.candy.amount).toBe('function');
  });

  it('should be a ModifiedMainskill', () => {
    expect(IngredientMagnetSPresent.isModified).toBe(true);
    expect(IngredientMagnetSPresent.isOrModifies(IngredientMagnetS)).toBe(true);
  });

  it('should have ingredients unit', () => {
    expect(IngredientMagnetSPresent.hasUnit('ingredients')).toBe(true);
    expect(IngredientMagnetSPresent.hasUnit('candy')).toBe(true);
  });

  it('should have specific RP values', () => {
    expect(IngredientMagnetSPresent.getRPValue(1)).toBe(880);
    expect(IngredientMagnetSPresent.getRPValue(3)).toBe(1726);
    expect(IngredientMagnetSPresent.getRPValue(6)).toBe(4546);
  });

  it('should calculate correct ingredient activation amounts', () => {
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 1 })).toBe(4);
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 2 })).toBe(6);
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 4 })).toBe(10);
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 7 })).toBe(17);
  });

  it('should calculate correct candy activation amounts (static at all levels)', () => {
    expect(IngredientMagnetSPresent.activations.candy.amount({ skillLevel: 1 })).toBe(4);
  });

  it('should have ingredient amounts less than Ingredient Magnet S', () => {
    // Ingredient Magnet S: [6, 8, 11, 14, 17, 21, 24]
    // Present: [4, 6, 8, 10, 12, 15, 17]
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 1 })).toBeLessThan(
      IngredientMagnetS.activations.ingredients.amount({ skillLevel: 1 })
    );
    expect(IngredientMagnetSPresent.activations.ingredients.amount({ skillLevel: 7 })).toBeLessThan(
      IngredientMagnetS.activations.ingredients.amount({ skillLevel: 7 })
    );
  });
});
