import type { PokemonWithIngredients } from '../../../types/pokemon/pokemon';
import { mockIngredientSet } from '../ingredient/mock-ingredient-set';
import { mockPokemon } from './mock-pokemon';

export function pokemonWithIngredients(attrs?: Partial<PokemonWithIngredients>): PokemonWithIngredients {
  return {
    pokemon: mockPokemon(),
    ingredientList: [mockIngredientSet()],
    ...attrs
  };
}
