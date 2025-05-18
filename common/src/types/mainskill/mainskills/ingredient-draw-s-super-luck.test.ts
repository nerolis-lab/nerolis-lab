import { describe, expect, it } from 'vitest';
import { BEAN_SAUSAGE, GREENGRASS_SOYBEANS, ROUSING_COFFEE, TASTY_MUSHROOM } from '../../ingredient/ingredients';
import { IngredientDrawS } from './ingredient-draw-s';
import { IngredientDrawSSuperLuck } from './ingredient-draw-s-super-luck';

describe('IngredientDrawSSuperLuck', () => {
  it('should have modified name format', () => {
    expect(IngredientDrawSSuperLuck.name).toBe('Super Luck (Ingredient Draw S)');
    expect(IngredientDrawSSuperLuck.modifierName).toBe('Super Luck');
    expect(IngredientDrawSSuperLuck.baseSkill).toBe(IngredientDrawS);
  });

  it('should have correct basic properties', () => {
    expect(IngredientDrawSSuperLuck.name).toBe('Super Luck (Ingredient Draw S)');
    expect(IngredientDrawSSuperLuck.description(1)).toBe(
      'Gets 5 of one type of ingredient chosen randomly from a specific selection of ingredients. On rare occasions, gets a great number of Dream Shards instead.'
    );
    expect(IngredientDrawSSuperLuck.RP).toEqual([880, 1251, 1726, 2383, 3290, 4846, 5843]);
    expect(IngredientDrawSSuperLuck.maxLevel).toBe(7);
  });

  it('should have ingredients activation', () => {
    expect(IngredientDrawSSuperLuck.activations).toHaveProperty('ingredients');
    expect(IngredientDrawSSuperLuck.activations.ingredients.unit).toBe('ingredients');
    expect(typeof IngredientDrawSSuperLuck.activations.ingredients.amount).toBe('function');
  });

  it('should have crit chance properties', () => {
    expect(IngredientDrawSSuperLuck.critChance).toBe(0.16);
    expect(IngredientDrawSSuperLuck.superCritChance).toBe(0.04);
  });

  it('should have dream shards activation with crit properties', () => {
    expect(IngredientDrawSSuperLuck.activations).toHaveProperty('dreamShards');
    expect(IngredientDrawSSuperLuck.activations.dreamShards.unit).toBe('dream shards');
    expect(typeof IngredientDrawSSuperLuck.activations.dreamShards.amount).toBe('function');
    expect(typeof IngredientDrawSSuperLuck.activations.dreamShards.critAmount).toBe('function');
  });

  it('should calculate correct ingredient amounts', () => {
    expect(IngredientDrawSSuperLuck.activations.ingredients.amount(1)).toBe(5);
    expect(IngredientDrawSSuperLuck.activations.ingredients.amount(4)).toBe(11);
    expect(IngredientDrawSSuperLuck.activations.ingredients.amount(7)).toBe(18);
  });

  it('should calculate correct dream shard amounts', () => {
    expect(IngredientDrawSSuperLuck.activations.dreamShards.amount(1)).toBe(500);
    expect(IngredientDrawSSuperLuck.activations.dreamShards.amount(4)).toBe(1440);
    expect(IngredientDrawSSuperLuck.activations.dreamShards.amount(7)).toBe(4000);
  });

  it('should calculate correct dream shard crit amounts', () => {
    expect(IngredientDrawSSuperLuck.activations.dreamShards.critAmount!(1)).toBe(2500);
    expect(IngredientDrawSSuperLuck.activations.dreamShards.critAmount!(4)).toBe(7200);
    expect(IngredientDrawSSuperLuck.activations.dreamShards.critAmount!(7)).toBe(20000);
  });

  it('should have specific ingredient draw ingredients', () => {
    const ingredients = IngredientDrawSSuperLuck.ingredientDrawIngredients;
    expect(ingredients).toEqual([BEAN_SAUSAGE, GREENGRASS_SOYBEANS, TASTY_MUSHROOM, ROUSING_COFFEE]);
    expect(ingredients).toHaveLength(4);
  });

  it('should have specific RP values', () => {
    expect(IngredientDrawSSuperLuck.getRPValue(1)).toBe(880);
    expect(IngredientDrawSSuperLuck.getRPValue(4)).toBe(2383);
    expect(IngredientDrawSSuperLuck.getRPValue(7)).toBe(5843);
  });
});
