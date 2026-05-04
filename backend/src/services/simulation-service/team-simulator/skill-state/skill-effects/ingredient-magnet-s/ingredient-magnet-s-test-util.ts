import type { IngredientSet } from 'sleepapi-common';
import { MathUtils } from 'sleepapi-common';

export function rounded(ingredients: IngredientSet[]) {
  return ingredients.map(({ ingredient, amount }) => ({
    ingredient,
    amount: MathUtils.round(amount, 2)
  }));
}
