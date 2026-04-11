import type { Pokemon } from '../../types/pokemon';

type sortOrder = 'asc' | 'desc';

export function sortPokemonByField<T extends keyof Pokemon>(
  pokemonList: Pokemon[],
  field: T,
  order: sortOrder = 'asc'
): Pokemon[] {
  return pokemonList.sort((pokemonA, pokemonB) => {
    const a = pokemonA[field];
    const b = pokemonB[field];
    if (a == null || b == null) return 0;
    if (a < b) return order === 'asc' ? -1 : 1;
    if (a > b) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
