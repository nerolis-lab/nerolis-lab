import { describe, expect, it } from 'vitest';
import { IngredientDrawS } from './ingredient-draw-s';

describe('IngredientDrawS', () => {
  it('should have correct basic properties', () => {
    expect(IngredientDrawS.name).toBe('Ingredient Draw S');
    expect(IngredientDrawS.description(1)).toBe(
      'Gets 6 of one type of ingredient chosen randomly from a specific selection of ingredients.'
    );
    expect(IngredientDrawS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4846, 5843]);
    expect(IngredientDrawS.maxLevel).toBe(7);
  });

  it('should have ingredients activation', () => {
    expect(IngredientDrawS.activations).toHaveProperty('ingredients');
    expect(IngredientDrawS.activations.ingredients.unit).toBe('ingredients');
    expect(typeof IngredientDrawS.activations.ingredients.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = IngredientDrawS.activations.ingredients.amount(1);
    const level6Amount = IngredientDrawS.activations.ingredients.amount(6);

    expect(level1Amount).toBe(6);
    expect(level6Amount).toBe(21);
  });

  it('should have ingredients unit only', () => {
    expect(IngredientDrawS.hasUnit('ingredients')).toBe(true);
    expect(IngredientDrawS.hasUnit('energy')).toBe(false);
    expect(IngredientDrawS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(IngredientDrawS.getRPValue(1)).toBe(880);
    expect(IngredientDrawS.getRPValue(3)).toBe(1726);
    expect(IngredientDrawS.getRPValue(6)).toBe(4846);
  });
});
