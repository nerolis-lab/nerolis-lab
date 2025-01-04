import { mockIngredientSet, type SurplusIngredients } from 'sleepapi-common';

export function surplusIngredients(attrs?: Partial<SurplusIngredients>): SurplusIngredients {
  return {
    total: [mockIngredientSet()],
    relevant: [mockIngredientSet()],
    extra: [mockIngredientSet()],
    ...attrs
  };
}
