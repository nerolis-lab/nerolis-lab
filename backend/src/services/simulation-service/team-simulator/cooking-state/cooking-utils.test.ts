import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { curry, dessert, salad } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('defaultUserRecipes', () => {
  it('should return sorted curries by valueMax in descending order', () => {
    const userRecipes = defaultUserRecipes();
    const sortedCurries = curry.CURRIES_FLAT.map((recipe) => ({ ...recipe, level: 60 })).sort(
      (a, b) => b.valueMax - a.valueMax
    );
    expect(userRecipes.curries).toEqual(sortedCurries);
  });

  it('should return sorted salads by valueMax in descending order', () => {
    const userRecipes = defaultUserRecipes();
    const sortedSalads = salad.SALADS_FLAT.map((recipe) => ({ ...recipe, level: 60 })).sort(
      (a, b) => b.valueMax - a.valueMax
    );
    expect(userRecipes.salads).toEqual(sortedSalads);
  });

  it('should return sorted desserts by valueMax in descending order', () => {
    const userRecipes = defaultUserRecipes();
    const sortedDesserts = dessert.DESSERTS_FLAT.map((recipe) => ({ ...recipe, level: 60 })).sort(
      (a, b) => b.valueMax - a.valueMax
    );
    expect(userRecipes.desserts).toEqual(sortedDesserts);
  });
});
