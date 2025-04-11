import type { PokemonWithIngredients, PokemonWithIngredientsIndexed } from 'sleepapi-common';
import { commonMocks } from 'sleepapi-common';

export function pokemonWithIngredients(attrs?: Partial<PokemonWithIngredients>): PokemonWithIngredients {
  return {
    pokemon: commonMocks.mockPokemon(),
    ingredientList: [commonMocks.mockIngredientSet()],
    ...attrs
  };
}

export function pokemonWithIngredientsIndexed(
  attrs?: Partial<PokemonWithIngredientsIndexed>
): PokemonWithIngredientsIndexed {
  return {
    pokemon: commonMocks.mockPokemon().name,
    ingredients: new Int16Array(),
    ...attrs
  };
}
