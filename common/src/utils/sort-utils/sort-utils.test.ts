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
  PIKACHU_HOLIDAY,
  RAICHU,
  RAIKOU,
  SYLVEON,
  TOGEKISS,
  VULPIX,
  VULPIX_ALOLAN
} from '../../domain/pokemon';
import type { Pokemon } from '../../domain/pokemon/pokemon';
import { sortPokemonByField } from './sort-utils';

describe('sortPokemonByField', () => {
  const pokemonList: Pokemon[] = [
    DEDENNE,
    DRAGONITE,
    FLAREON,
    GALLADE,
    GLACEON,
    LEAFEON,
    MAGNEZONE,
    VULPIX,
    VULPIX_ALOLAN,
    PIKACHU,
    PIKACHU_HOLIDAY,
    RAICHU,
    RAIKOU,
    SYLVEON,
    TOGEKISS,
    ABSOL,
    CATERPIE,
    CHARIZARD
  ];

  it('should sort by name in ascending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'name', 'asc');
    expect(sorted.map((pokemon) => pokemon.name)).toEqual([
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
      'PIKACHU_HOLIDAY',
      'RAICHU',
      'RAIKOU',
      'SYLVEON',
      'TOGEKISS',
      'VULPIX',
      'VULPIX_ALOLAN'
    ]);
  });

  it('should sort by name in descending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'name', 'desc');
    expect(sorted.map((pokemon) => pokemon.name)).toEqual([
      'VULPIX_ALOLAN',
      'VULPIX',
      'TOGEKISS',
      'SYLVEON',
      'RAIKOU',
      'RAICHU',
      'PIKACHU_HOLIDAY',
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
      'ABSOL'
    ]);
  });

  it('should sort by pokedex number in ascending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'pokedexNumber', 'asc');
    expect(sorted.map((pokemon) => pokemon.pokedexNumber)).toEqual([
      6, 10, 25, 25, 26, 37, 37, 136, 149, 243, 359, 462, 468, 470, 471, 475, 700, 702
    ]);
  });

  it('should sort by pokedex number in descending order', () => {
    const sorted = sortPokemonByField(pokemonList, 'pokedexNumber', 'desc');
    expect(sorted.map((pokemon) => pokemon.pokedexNumber)).toEqual([
      702, 700, 475, 471, 470, 468, 462, 359, 243, 149, 136, 37, 37, 26, 25, 25, 10, 6
    ]);
  });

  it('should handle an empty list', () => {
    const sorted = sortPokemonByField([], 'name', 'asc');
    expect(sorted).toEqual([]);
  });

  it('should handle a single-element list', () => {
    const singleElementList: Pokemon[] = [PIKACHU_HOLIDAY];
    const sorted = sortPokemonByField(singleElementList, 'name', 'asc');
    expect(sorted).toEqual(singleElementList);
  });
});
