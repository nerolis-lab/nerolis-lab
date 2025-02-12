import { describe, expect, it } from 'vitest';
import type { Ingredient } from './ingredient';
import * as IngredientsModule from './ingredients';
import { createIngredient } from './ingredients';

describe('INGREDIENTS array', () => {
  it('should include all dynamically defined ingredients in the INGREDIENTS array', () => {
    // Dynamically extract all constants that are Ingredient objects
    const allIngredients = Object.values(IngredientsModule).filter(
      (value): value is Ingredient =>
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        'value' in value &&
        'identifier' in value &&
        'taxedValue' in value &&
        'longName' in value
    );

    allIngredients.forEach((ingredient) => {
      expect(IngredientsModule.INGREDIENTS).toContainEqual(ingredient);
    });
  });
});

describe('createIngredient', () => {
  it('should create an ingredient', () => {
    const ingredient = createIngredient('Seaweed', 10, 15, 'Squirmy Seaweed');

    expect(ingredient.name).toBe('Seaweed');
    expect(ingredient.value).toBe(10);
    expect(ingredient.taxedValue).toBe(15);
    expect(ingredient.longName).toBe('Squirmy Seaweed');
  });
});
