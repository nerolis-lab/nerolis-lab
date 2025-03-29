import type {
  SetCoverPokemonSetup,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { pokemonWithIngredientsIndexed } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettingsResult } from '@src/vitest/mocks/team/mock-team-member-settings-ext.js';
import { AVERAGE_WEEKLY_CRIT_MULTIPLIER, commonMocks } from 'sleepapi-common';

export function setCoverPokemonSetup(attrs?: Partial<SetCoverPokemonSetup>): SetCoverPokemonSetup {
  return {
    pokemonSet: pokemonWithIngredientsIndexed(),
    totalIngredients: new Int16Array(),
    ...attrs
  };
}

export function setCoverPokemonWithSettings(
  attrs?: Partial<SetCoverPokemonSetupWithSettings>
): SetCoverPokemonSetupWithSettings {
  return {
    pokemonSet: pokemonWithIngredientsIndexed(),
    totalIngredients: new Int16Array(),
    ingredientList: [commonMocks.mockIngredientSet()],
    critMultiplier: AVERAGE_WEEKLY_CRIT_MULTIPLIER,
    averageHelps: 0,
    averageWeekdayPotSize: 0,
    skillIngredients: commonMocks.mockIngredientSetFloatIndexed(),
    totalIngredientsFloat: commonMocks.mockIngredientSetFloatIndexed(),
    settings: teamMemberSettingsResult(),
    ...attrs
  };
}
