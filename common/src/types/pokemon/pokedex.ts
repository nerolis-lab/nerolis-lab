import type { Pokemon, PokemonName } from './pokemon';

export type Pokedex = Map<PokemonName, Pokemon>;

export const OPTIMAL_POKEDEX: Pokedex = new Map<PokemonName, Pokemon>();
export const INFERIOR_POKEDEX: Pokedex = new Map<PokemonName, Pokemon>();
export const COMPLETE_POKEDEX: Pokedex = new Map<PokemonName, Pokemon>();

/**
 * Add a new mon or update an existing mon in the Pokedex
 */
export function addToPokedex(name: PokemonName, mon: Pokemon) {
  if (mon.remainingEvolutions === 0) {
    OPTIMAL_POKEDEX.set(name, mon);
  } else {
    INFERIOR_POKEDEX.set(name, mon);
  }
  COMPLETE_POKEDEX.set(name, mon);
}
