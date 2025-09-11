import type { PokemonInstance, PokemonInstanceExt } from '../../../types/instance';
import { BASHFUL } from '../../../types/nature';
import { mockPokemon } from './mock-pokemon';

export function pokemonInstance(attrs?: Partial<PokemonInstance>): PokemonInstance {
  return {
    pokemon: mockPokemon().name,
    level: 1,
    ribbon: 0,
    carrySize: 0,
    skillLevel: 0,
    nature: 'normal',
    subskills: [],
    ingredients: [],
    ...attrs
  };
}

export function pokemonInstanceExt(attrs?: Partial<PokemonInstanceExt>): PokemonInstanceExt {
  return {
    ...pokemonInstance(),
    rp: 0,
    pokemon: mockPokemon(),
    nature: BASHFUL,
    subskills: [],
    ingredients: [],
    carrySize: 0,
    skillLevel: 0,
    ribbon: 0,
    version: 0,
    externalId: '1',
    saved: false,
    shiny: false,
    gender: undefined,
    name: 'Mockemon',
    ...attrs
  };
}
