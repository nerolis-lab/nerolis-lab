import { describe, expect, it } from 'vitest';
import {
  ABSOL,
  CATERPIE,
  CHARIZARD,
  DEDENNE,
  DRAGONITE,
  FLAREON,
  GALLADE,
  GLACEON,
  LEAFEON,
  MAGNEZONE,
  PIKACHU,
  PIKACHU_CHRISTMAS,
  RAICHU,
  RAIKOU,
  SYLVEON,
  TOGEKISS,
  VULPIX,
  VULPIX_ALOLAN
} from '../../domain/pokemon';
import { Pokemon } from '../../domain/pokemon/pokemon';
import {
  sortPokemonByField
} from './sort-utils';

describe('sortPokemonByField', () => {
  const pokemonList: Pokemon[] = [DEDENNE, DRAGONITE, FLAREON, GALLADE, GLACEON, LEAFEON, MAGNEZONE, VULPIX, VULPIX_ALOLAN, PIKACHU, PIKACHU_CHRISTMAS, RAICHU, RAIKOU, SYLVEON, TOGEKISS, ABSOL, CATERPIE, CHARIZARD];

  it('should sort by name in ascending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'name', 'asc');
    expect(sorted.map(pokemon => pokemon.name)).toEqual([
      'ABSOL',
      'CATERPIE',
      'CHARIZARD',
      'DEDENNE',
      'DRAGONITE',
      'FLAREON',
      'GALLADE',
      'GLACEON',
      'LEAFEON',
      'MAGNEZONE',
      'PIKACHU',
      'PIKACHU_CHRISTMAS',
      'RAICHU',
      'RAIKOU',
      'SYLVEON',
      'TOGEKISS',
      'VULPIX',
      'VULPIX_ALOLAN']);
  });

  it('should sort by name in descending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'name', 'desc');
    expect(sorted.map(pokemon => pokemon.name)).toEqual([    
    'VULPIX_ALOLAN',
    'VULPIX',
    'TOGEKISS',
    'SYLVEON',
    'RAIKOU',
    'RAICHU',
    'PIKACHU_CHRISTMAS',
    'PIKACHU',
    'MAGNEZONE',
    'LEAFEON',
    'GLACEON',
    'GALLADE',
    'FLAREON',
    'DRAGONITE',
    'DEDENNE',
    'CHARIZARD',
    'CATERPIE',
    'ABSOL']);
  });

  it('should sort by pokedex number in ascending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'pokedexNumber', 'asc');
    expect(sorted.map(pokemon => pokemon.pokedexNumber)).toEqual([    
    'CATERPIE',
    'CHARIZARD',
    'VULPIX_ALOLAN',
    'VULPIX',
    'PIKACHU_CHRISTMAS',
    'PIKACHU',
    'RAICHU',
    'DRAGONITE',
    'FLAREON',
    'MAGNEZONE',
    'LEAFEON',
    'GLACEON',
    'GALLADE',
    'TOGEKISS',
    'RAIKOU',
    'ABSOL',
    'SYLVEON',
    'DEDENNE']);
  });

  it('should sort by pokedex number in descending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'pokedexNumber', 'desc');
    expect(sorted.map(pokemon => pokemon.pokedexNumber)).toEqual([    
    'DEDENNE',
    'SYLVEON',
    'ABSOL',
    'RAIKOU',
    'TOGEKISS',
    'GALLADE',
    'GLACEON',
    'LEAFEON',
    'MAGNEZONE',
    'FLAREON',
    'DRAGONITE',
    'RAICHU',
    'PIKACHU',
    'PIKACHU_CHRISTMAS',
    'VULPIX',
    'VULPIX_ALOLAN',
    'CHARIZARD',
    'CATERPIE']);
  });

  it('should handle an empty list', () => {
    const sorted = sortPokemonByField([], 'name', 'asc');
    expect(sorted).toEqual([]);
  });

  it('should handle a single-element list', () => {
    const singleElementList: Pokemon[] = [PIKACHU_CHRISTMAS];
    const sorted = sortPokemonByField(singleElementList, 'name', 'asc');
    expect(sorted).toEqual(singleElementList);
  });
});