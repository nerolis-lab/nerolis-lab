import { commonMocks, type SurplusIngredients } from 'sleepapi-common';

export function surplusIngredients(attrs?: Partial<SurplusIngredients>): SurplusIngredients {
  return {
    total: [commonMocks.mockIngredientSet()],
    relevant: [commonMocks.mockIngredientSet()],
    extra: [commonMocks.mockIngredientSet()],
    ...attrs
  };
}
