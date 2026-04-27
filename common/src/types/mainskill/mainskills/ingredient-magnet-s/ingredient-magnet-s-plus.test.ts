import { describe, expect, it } from 'vitest';
import { IngredientMagnetS } from './ingredient-magnet-s';
import { IngredientMagnetSPlus } from './ingredient-magnet-s-plus';

describe('IngredientMagnetSPlus', () => {
  it('should have modified name format', () => {
    expect(IngredientMagnetSPlus.name).toBe('Plus (Ingredient Magnet S)');
    expect(IngredientMagnetSPlus.modifierName).toBe('Plus');
    expect(IngredientMagnetSPlus.baseSkill).toBe(IngredientMagnetS);
  });

  it('should have correct basic properties', () => {
    expect(IngredientMagnetSPlus.name).toBe('Plus (Ingredient Magnet S)');
    expect(IngredientMagnetSPlus.description({ skillLevel: 1 })).toBe(
      'Gets you 5 ingredients chosen at random. \n    Meet certain conditions to get an additional 0 undefineds'
    );
    expect(IngredientMagnetSPlus.maxLevel).toBe(7);
  });

  it('should have specific RP values', () => {
    expect(IngredientMagnetSPlus.getRPValue(1)).toBe(880);
    expect(IngredientMagnetSPlus.getRPValue(4)).toBe(2383);
    expect(IngredientMagnetSPlus.getRPValue(7)).toBe(5843);
  });

  it('should have solo activation', () => {
    expect(IngredientMagnetSPlus.activations).toHaveProperty('solo');
    expect(IngredientMagnetSPlus.activations.solo.unit).toBe('ingredients');
    expect(typeof IngredientMagnetSPlus.activations.solo.amount).toBe('function');
  });

  it('should have paired activation', () => {
    expect(IngredientMagnetSPlus.activations).toHaveProperty('paired');
    expect(IngredientMagnetSPlus.activations.paired.unit).toBe('ingredients');
    expect(typeof IngredientMagnetSPlus.activations.paired.amount).toBe('function');
  });

  it('should calculate correct ingredient amounts', () => {
    expect(IngredientMagnetSPlus.activations.solo.amount({ skillLevel: 1 })).toBe(5);
    expect(IngredientMagnetSPlus.activations.solo.amount({ skillLevel: 4 })).toBe(11);
    expect(IngredientMagnetSPlus.activations.solo.amount({ skillLevel: 7 })).toBe(18);
    expect(IngredientMagnetSPlus.activations.paired.amount({ skillLevel: 1 })).toBe(0);
    expect(IngredientMagnetSPlus.activations.paired.amount({ skillLevel: 4 })).toBe(0);
    expect(IngredientMagnetSPlus.activations.paired.amount({ skillLevel: 7 })).toBe(0);
  });

  it('should return 0 for bonus amounts when no matching ingredient', () => {
    // Test with no ingredient
    expect(IngredientMagnetSPlus.getBonusAmount({ skillLevel: 1 })).toBe(0);

    // Test with ingredient not in bonus map
    const mockIngredient = {
      name: 'Mock Ingredient',
      value: 100,
      taxedValue: 90,
      longName: 'Mock Ingredient'
    };
    expect(IngredientMagnetSPlus.getBonusAmount({ skillLevel: 1, ingredient: mockIngredient })).toBe(0);

    // Test activations
    expect(IngredientMagnetSPlus.activations.paired.amount({ skillLevel: 1 })).toBe(0);
    expect(IngredientMagnetSPlus.activations.paired.amount({ skillLevel: 1, ingredient: mockIngredient })).toBe(0);
  });
});
