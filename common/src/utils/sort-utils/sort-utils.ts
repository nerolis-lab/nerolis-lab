import type { Pokemon } from '../../domain/pokemon';

type sortOrder = 'asc' | 'desc';

export function sortPokemonByField<T extends keyof Pokemon>(
  pokemonList: Pokemon[],
  field: T,
  order: sortOrder = 'asc'
): Pokemon[] {
  return pokemonList.sort((pokemonA, pokemonB) => {
    if (pokemonA[field] < pokemonB[field]) {
      return order === 'asc' ? -1 : 1;
    }
    if (pokemonA[field] > pokemonB[field]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
