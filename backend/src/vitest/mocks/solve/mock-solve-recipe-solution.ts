import type { SolveRecipeSolution, SolveRecipeSolutionWithSettings } from '@src/services/solve/types/solution-types.js';
import { setCoverPokemonWithSettings } from '@src/vitest/mocks/solve/mock-set-cover-pokemon-with-settings.js';
import { commonMocks } from 'sleepapi-common';

export function solveRecipeSolution(attrs?: Partial<SolveRecipeSolution>): SolveRecipeSolution {
  return {
    members: [setCoverPokemonWithSettings()],
    producedIngredients: commonMocks.mockIngredientSetIntIndexed(),
    ...attrs
  };
}

export function solveRecipeSolutionWithSettings(
  attrs?: Partial<SolveRecipeSolutionWithSettings>
): SolveRecipeSolutionWithSettings {
  return {
    members: [setCoverPokemonWithSettings()],
    producedIngredients: commonMocks.mockIngredientSetIntIndexed(),
    ...attrs
  };
}
