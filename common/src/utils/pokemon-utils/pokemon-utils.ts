import type { Pokemon } from '../../domain/pokemon';
import { COMPLETE_POKEDEX } from '../../domain/pokemon';

export function getPokemon(name: string): Pokemon {
  const pkmn = COMPLETE_POKEDEX.find((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase());
  if (!pkmn) {
    throw new Error(`Can't find Pokemon with name ${name}`);
  }
  return pkmn;
}
