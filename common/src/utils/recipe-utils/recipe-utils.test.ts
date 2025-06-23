import { describe, expect, it } from 'vitest';
import type { IngredientIndexToIntAmount } from '../../types/ingredient/ingredient';
import { TOTAL_NUMBER_OF_INGREDIENTS } from '../../types/ingredient/ingredients';
import { commonMocks } from '../../vitest';
import { flatToIngredientSet, ingredientSetToIntFlat } from '../ingredient-utils';
import { recipeCoverage } from './recipe-utils';
describe('recipeCoverage', () => {
  const createExpectedRemainingRecipe = (values: number[]): Int16Array => {
    return new Int16Array([...values, ...Array(TOTAL_NUMBER_OF_INGREDIENTS - values.length).fill(0)]);
  };

  it('should calculate correct coverage when some ingredients match', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([0, 10, 5, 0])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 5, 8, 1]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBeCloseTo(66.67, 2);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 5, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(5);
  });

  it('should return 100% when all recipe ingredients are fully covered', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 10, 15]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(100);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should not overvalue when ingredients are overcovered', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5000, 1000, 1500]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(100);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should return 0% when no ingredients are provided', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([0, 0, 0]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(0);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([5, 10, 15]));
    expect(result.sumRemainingIngredients).toBe(30);
  });

  it('should ignore indices where recipe ingredients are 0', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([0, 10, 0, 20])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([100, 5, 50, 10]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(50); // Only 5/10 + 10/20 is considered
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 5, 0, 10]));
    expect(result.sumRemainingIngredients).toBe(15);
  });

  it('should handle an empty recipe gracefully', () => {
    const recipe = ingredientSetToIntFlat(commonMocks.mockRecipe().ingredients);
    const ingredients: IngredientIndexToIntAmount = new Int16Array([]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(0);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should handle partial coverage of ingredients', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.mockRecipe({ ingredients: flatToIngredientSet(new Int16Array([10, 20, 30])) }).ingredients
    );

    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 25, 10]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBeCloseTo(58.3, 1);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([5, 0, 20]));
    expect(result.sumRemainingIngredients).toBe(25);
  });
});

import type { IngredientSet } from '../../types/ingredient';
import { mockIngredient } from '../../vitest/mocks';
import { calculateRecipeValue, createCurry, createDessert, createSalad, recipesToFlat } from './recipe-utils';

describe('createCurry', () => {
  it('should create a curry recipe', () => {
    const ingredients: IngredientSet[] = [
      { ingredient: mockIngredient({ name: 'ingredient1', value: 10 }), amount: 2 },
      { ingredient: mockIngredient({ name: 'ingredient2', value: 5 }), amount: 3 }
    ];
    const recipe = createCurry({ name: 'TEST_CURRY', displayName: 'Test Curry', ingredients, bonus: 10 });

    expect(recipe.name).toBe('TEST_CURRY');
    expect(recipe.displayName).toBe('Test Curry');
    expect(recipe.type).toBe('curry');
    expect(recipe.ingredients).toEqual(ingredients);
    expect(recipe.bonus).toBe(10);
    expect(recipe.nrOfIngredients).toBe(5);
  });
});

describe('createSalad', () => {
  it('should create a salad recipe', () => {
    const ingredients: IngredientSet[] = [
      { ingredient: mockIngredient({ name: 'ingredient1', value: 10 }), amount: 2 },
      { ingredient: mockIngredient({ name: 'ingredient2', value: 5 }), amount: 3 }
    ];
    const recipe = createSalad({ name: 'TEST_SALAD', displayName: 'Test Salad', ingredients, bonus: 10 });

    expect(recipe.name).toBe('TEST_SALAD');
    expect(recipe.displayName).toBe('Test Salad');
    expect(recipe.type).toBe('salad');
    expect(recipe.ingredients).toEqual(ingredients);
    expect(recipe.bonus).toBe(10);
    expect(recipe.nrOfIngredients).toBe(5);
  });
});

describe('createDessert', () => {
  it('should create a dessert recipe', () => {
    const ingredients: IngredientSet[] = [
      { ingredient: mockIngredient({ name: 'ingredient1', value: 10 }), amount: 2 },
      { ingredient: mockIngredient({ name: 'ingredient2', value: 5 }), amount: 3 }
    ];
    const recipe = createDessert({ name: 'TEST_DESSERT', displayName: 'Test Dessert', ingredients, bonus: 10 });

    expect(recipe.name).toBe('TEST_DESSERT');
    expect(recipe.displayName).toBe('Test Dessert');
    expect(recipe.type).toBe('dessert');
    expect(recipe.ingredients).toEqual(ingredients);
    expect(recipe.bonus).toBe(10);
    expect(recipe.nrOfIngredients).toBe(5);
  });
});

describe('recipesToFlat', () => {
  it('should convert a single recipe to flat format', () => {
    const recipe = commonMocks.mockRecipe();
    const flatRecipe = recipesToFlat(recipe);

    expect(flatRecipe.name).toBe(recipe.name);
    expect(flatRecipe.ingredients).toEqual(expect.any(Float32Array));
    expect(flatRecipe.value).toBe(recipe.value);
    expect(flatRecipe.valueMax).toBe(recipe.valueMax);
    expect(flatRecipe.type).toBe(recipe.type);
    expect(flatRecipe.bonus).toBe(recipe.bonus);
    expect(flatRecipe.nrOfIngredients).toBe(recipe.nrOfIngredients);
  });

  it('should convert multiple recipes to flat format', () => {
    const recipes = [commonMocks.mockRecipe(), commonMocks.mockRecipe()];
    const flatRecipes = recipesToFlat(recipes);

    expect(flatRecipes).toHaveLength(2);
    flatRecipes.forEach((flatRecipe, index) => {
      const recipe = recipes[index];
      expect(flatRecipe.name).toBe(recipe.name);
      expect(flatRecipe.ingredients).toEqual(expect.any(Float32Array));
      expect(flatRecipe.value).toBe(recipe.value);
      expect(flatRecipe.valueMax).toBe(recipe.valueMax);
      expect(flatRecipe.type).toBe(recipe.type);
      expect(flatRecipe.bonus).toBe(recipe.bonus);
      expect(flatRecipe.nrOfIngredients).toBe(recipe.nrOfIngredients);
    });
  });
});

describe('calculateRecipeValue', () => {
  it('should calculate the correct recipe value', () => {
    const ingredients: IngredientSet[] = [
      { ingredient: mockIngredient({ name: 'ingredient1', value: 10 }), amount: 2 },
      { ingredient: mockIngredient({ name: 'ingredient2', value: 5 }), amount: 3 }
    ];
    const value = calculateRecipeValue({ level: 1, ingredients, bonus: 10 });

    expect(value).toBeGreaterThan(0);
  });

  it('should calculate the correct recipe value with different levels', () => {
    const ingredients: IngredientSet[] = [
      { ingredient: mockIngredient({ name: 'ingredient1', value: 10 }), amount: 2 },
      { ingredient: mockIngredient({ name: 'ingredient2', value: 5 }), amount: 3 }
    ];
    const valueLevel1 = calculateRecipeValue({ level: 1, ingredients, bonus: 10 });
    const valueLevel10 = calculateRecipeValue({ level: 10, ingredients, bonus: 10 });

    expect(valueLevel10).toBeGreaterThan(valueLevel1);
  });
});
