import { describe, expect, it } from 'vitest';
import { IngredientMagnetS } from './ingredient-magnet-s';
import { PresentIngredientMagnetS } from './present-ingredient-magnet-s';

describe('PresentIngredientMagnetS', () => {
  it('should have correct basic properties', () => {
    expect(PresentIngredientMagnetS.name).toBe('Present (Ingredient Magnet S)');
    expect(PresentIngredientMagnetS.baseSkill).toBe(IngredientMagnetS);
    expect(PresentIngredientMagnetS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(PresentIngredientMagnetS.maxLevel).toBe(7);
  });

  it('should have ingredient and candy activations', () => {
    expect(PresentIngredientMagnetS.activations).toHaveProperty('ingredients');
    expect(PresentIngredientMagnetS.activations).toHaveProperty('candy');
    expect(PresentIngredientMagnetS.activations.ingredients.unit).toBe('ingredients');
    expect(PresentIngredientMagnetS.activations.candy.unit).toBe('candy');
    expect(typeof PresentIngredientMagnetS.activations.ingredients.amount).toBe('function');
    expect(typeof PresentIngredientMagnetS.activations.candy.amount).toBe('function');
  });

  it('should be a ModifiedMainskill', () => {
    expect(PresentIngredientMagnetS.isModified).toBe(true);
    expect(PresentIngredientMagnetS.isOrModifies(IngredientMagnetS)).toBe(true);
  });

  it('should have ingredients unit', () => {
    expect(PresentIngredientMagnetS.hasUnit('ingredients')).toBe(true);
    expect(PresentIngredientMagnetS.hasUnit('candy')).toBe(true);
  });

  it('should have specific RP values', () => {
    expect(PresentIngredientMagnetS.getRPValue(1)).toBe(880);
    expect(PresentIngredientMagnetS.getRPValue(3)).toBe(1726);
    expect(PresentIngredientMagnetS.getRPValue(6)).toBe(4546);
  });

  it('should calculate correct ingredient activation amounts', () => {
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 1 })).toBe(4);
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 2 })).toBe(6);
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 4 })).toBe(10);
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 7 })).toBe(17);
  });

  it('should calculate correct candy activation amounts (static at all levels)', () => {
    expect(PresentIngredientMagnetS.activations.candy.amount()).toBe(4);
  });

  it('should have ingredient amounts less than Ingredient Magnet S', () => {
    // Ingredient Magnet S: [6, 8, 11, 14, 17, 21, 24]
    // Present: [4, 6, 8, 10, 12, 15, 17]
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 1 })).toBeLessThan(
      IngredientMagnetS.activations.ingredients.amount({ skillLevel: 1 })
    );
    expect(PresentIngredientMagnetS.activations.ingredients.amount({ skillLevel: 7 })).toBeLessThan(
      IngredientMagnetS.activations.ingredients.amount({ skillLevel: 7 })
    );
  });
});
