import { describe, expect, it } from 'vitest';
import { getRecipe, RECIPES } from './recipe';

describe('getRecipe', () => {
  it('should return the correct recipe when a valid name is provided', () => {
    const recipeName = RECIPES[0].name;
    const recipe = getRecipe(recipeName);
    expect(recipe).toEqual(RECIPES[0]);
  });

  it('should throw an error when an invalid name is provided', () => {
    const invalidName = 'invalidRecipeName';
    expect(() => getRecipe(invalidName)).toThrowError(`Recipe not found: ${invalidName}`);
  });
});
