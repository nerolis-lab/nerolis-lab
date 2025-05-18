import type { Recipe } from '../../../types/recipe/recipe';
import { mockIngredientSet } from '../ingredient/mock-ingredient-set';

export function mockRecipe(attrs?: Partial<Recipe>): Recipe {
  return {
    bonus: 0,
    name: 'MOCK_RECIPE',
    displayName: 'Mock Recipe',
    nrOfIngredients: 0,
    ingredients: [mockIngredientSet()],
    type: 'curry',
    value: 0,
    valueMax: 0,
    ...attrs
  };
}
