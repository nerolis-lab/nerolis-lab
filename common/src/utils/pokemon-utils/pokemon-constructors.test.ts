import { describe, expect, it } from 'vitest';
import type { IngredientSetDefinition } from './pokemon-constructors';
import { getIngredientSet, getIngredientSets } from './pokemon-constructors';
import { BEAN_SAUSAGE, GREENGRASS_SOYBEANS, LARGE_LEEK, PURE_OIL } from '../../types/ingredient/ingredients';

describe('getIngredientSet', () => {
  it('shall compute level 0 soybean drop for Quaxly', () => {
    const ingSet = getIngredientSet(GREENGRASS_SOYBEANS, GREENGRASS_SOYBEANS, 0, 'ingredient');
    expect(ingSet.amount).toBe(2);
  });

  it('shall compute level 30 soybean drop for Quaxly', () => {
    const ingSet = getIngredientSet(GREENGRASS_SOYBEANS, GREENGRASS_SOYBEANS, 30, 'ingredient');
    expect(ingSet.amount).toBe(5);
  });

  it('shall compute level 30 leek drop for Quaxly', () => {
    const ingSet = getIngredientSet(LARGE_LEEK, GREENGRASS_SOYBEANS, 30, 'ingredient');
    expect(ingSet.amount).toBe(2);
  });

  it('shall compute level 60 soybean drop for Quaxly', () => {
    const ingSet = getIngredientSet(GREENGRASS_SOYBEANS, GREENGRASS_SOYBEANS, 60, 'ingredient');
    expect(ingSet.amount).toBe(7);
  });

  it('shall compute level 60 leek drop for Quaxly', () => {
    const ingSet = getIngredientSet(LARGE_LEEK, GREENGRASS_SOYBEANS, 60, 'ingredient');
    expect(ingSet.amount).toBe(4);
  });

  it('shall compute level 60 oil drop for Quaxly', () => {
    const ingSet = getIngredientSet(PURE_OIL, GREENGRASS_SOYBEANS, 60, 'ingredient');
    expect(ingSet.amount).toBe(6);
  });

  it('shall compute level 0 sausage drop for Totodile', () => {
    const ingSet = getIngredientSet(BEAN_SAUSAGE, BEAN_SAUSAGE, 0, 'berry');
    expect(ingSet.amount).toBe(1);
  });

  it('shall compute level 30 sausage drop for Totodile', () => {
    const ingSet = getIngredientSet(BEAN_SAUSAGE, BEAN_SAUSAGE, 30, 'berry');
    expect(ingSet.amount).toBe(2);
  });

  it('shall compute level 30 oil drop for Totodile', () => {
    const ingSet = getIngredientSet(PURE_OIL, BEAN_SAUSAGE, 30, 'berry');
    expect(ingSet.amount).toBe(2);
  });

  it('shall compute level 60 sausage drop for Totodile', () => {
    const ingSet = getIngredientSet(BEAN_SAUSAGE, BEAN_SAUSAGE, 60, 'berry');
    expect(ingSet.amount).toBe(4);
  });

  it('shall compute level 60 oil drop for Totodile', () => {
    const ingSet = getIngredientSet(PURE_OIL, BEAN_SAUSAGE, 60, 'berry');
    expect(ingSet.amount).toBe(3);
  });
});

describe('getIngredientSets', () => {
  it('shall find all ingredient drops for Quaxly', () => {
    const ingSets = getIngredientSets({ a: GREENGRASS_SOYBEANS, b: LARGE_LEEK, c: PURE_OIL }, 'ingredient');
    const expected: IngredientSetDefinition = {
      ingredient0: [{ amount: 2, ingredient: GREENGRASS_SOYBEANS }],
      ingredient30: [
        { amount: 5, ingredient: GREENGRASS_SOYBEANS },
        { amount: 2, ingredient: LARGE_LEEK }
      ],
      ingredient60: [
        { amount: 7, ingredient: GREENGRASS_SOYBEANS },
        { amount: 4, ingredient: LARGE_LEEK },
        { amount: 6, ingredient: PURE_OIL }
      ]
    };
    expect(ingSets).toStrictEqual(expected);
  });

  it('shall find all ingredient drops for Totodile', () => {
    const ingSets = getIngredientSets({ a: BEAN_SAUSAGE, b: PURE_OIL }, 'berry');
    const expected: IngredientSetDefinition = {
      ingredient0: [{ amount: 1, ingredient: BEAN_SAUSAGE }],
      ingredient30: [
        { amount: 2, ingredient: BEAN_SAUSAGE },
        { amount: 2, ingredient: PURE_OIL }
      ],
      ingredient60: [
        { amount: 4, ingredient: BEAN_SAUSAGE },
        { amount: 3, ingredient: PURE_OIL }
      ]
    };
    expect(ingSets).toStrictEqual(expected);
  });
});
