import { describe, expect, it } from 'vitest';
import { GREENGRASS_CORN, PURE_OIL, SNOOZY_TOMATO, SOFT_POTATO } from '../../ingredient/ingredients';
import { IngredientDrawS } from './ingredient-draw-s';
import { IngredientDrawSHyperCutter } from './ingredient-draw-s-hyper-cutter';

describe('IngredientDrawSHyperCutter', () => {
  it('should have modified name format', () => {
    expect(IngredientDrawSHyperCutter.name).toBe('Hyper Cutter (Ingredient Draw S)');
    expect(IngredientDrawSHyperCutter.modifierName).toBe('Hyper Cutter');
    expect(IngredientDrawSHyperCutter.baseSkill).toBe(IngredientDrawS);
  });

  it('should have correct basic properties', () => {
    expect(IngredientDrawSHyperCutter.name).toBe('Hyper Cutter (Ingredient Draw S)');
    expect(IngredientDrawSHyperCutter.description(1)).toBe(
      'Gets 5 of one type of ingredient chosen randomly from a specific selection of ingredients. On rare occasions, gets twice as many ingredients.'
    );
    expect(IngredientDrawSHyperCutter.RP).toEqual([880, 1251, 1726, 2383, 3290, 4846, 5843]);
    expect(IngredientDrawSHyperCutter.maxLevel).toBe(7);
  });

  it('should have ingredients activation', () => {
    expect(IngredientDrawSHyperCutter.activations).toHaveProperty('ingredients');
    expect(IngredientDrawSHyperCutter.activations.ingredients.unit).toBe('ingredients');
    expect(typeof IngredientDrawSHyperCutter.activations.ingredients.amount).toBe('function');
  });

  it('should have crit chance properties', () => {
    expect(IngredientDrawSHyperCutter.critChance).toBe(0.16);
  });

  it('should calculate correct ingredient amounts', () => {
    expect(IngredientDrawSHyperCutter.activations.ingredients.amount(1)).toBe(5);
    expect(IngredientDrawSHyperCutter.activations.ingredients.amount(4)).toBe(11);
    expect(IngredientDrawSHyperCutter.activations.ingredients.amount(7)).toBe(18);
  });

  it('should calculate correct ingredient crit amounts', () => {
    expect(IngredientDrawSHyperCutter.activations.ingredients.critAmount!(1)).toBe(10);
    expect(IngredientDrawSHyperCutter.activations.ingredients.critAmount!(4)).toBe(22);
    expect(IngredientDrawSHyperCutter.activations.ingredients.critAmount!(7)).toBe(36);
  });

  it('should have specific ingredient draw ingredients', () => {
    const ingredients = IngredientDrawSHyperCutter.ingredientDrawIngredients;
    expect(ingredients).toEqual([SOFT_POTATO, PURE_OIL, SNOOZY_TOMATO, GREENGRASS_CORN]);
    expect(ingredients).toHaveLength(4);
  });

  it('should have specific RP values', () => {
    expect(IngredientDrawSHyperCutter.getRPValue(1)).toBe(880);
    expect(IngredientDrawSHyperCutter.getRPValue(4)).toBe(2383);
    expect(IngredientDrawSHyperCutter.getRPValue(7)).toBe(5843);
  });
});
