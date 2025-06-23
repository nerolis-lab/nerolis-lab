import { BULBASAUR, CHARMANDER, PIKACHU } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { createTierlistIndex } from './tierlist-utils.js';

describe('createTierlistIndex', () => {
  it('returns empty map for empty array', () => {
    const result = createTierlistIndex([]);
    expect(result.size).toBe(0);
  });

  it('creates index map with correct indices for unique pokemon', () => {
    const entries = [PIKACHU.name, CHARMANDER.name, BULBASAUR.name];

    const result = createTierlistIndex(entries);

    expect(result.size).toBe(3);
    expect(result.get(PIKACHU.name)).toBe(0);
    expect(result.get(CHARMANDER.name)).toBe(1);
    expect(result.get(BULBASAUR.name)).toBe(2);
  });

  it('only keeps the first occurrence of duplicate pokemon', () => {
    const entries = [
      PIKACHU.name,
      CHARMANDER.name,
      PIKACHU.name, // Duplicate
      BULBASAUR.name,
      CHARMANDER.name // Duplicate
    ];

    const result = createTierlistIndex(entries);

    expect(result.size).toBe(3);
    expect(result.get(PIKACHU.name)).toBe(0); // First occurrence index
    expect(result.get(CHARMANDER.name)).toBe(1); // First occurrence index
    expect(result.get(BULBASAUR.name)).toBe(2); // Bulbasaur is the third entry
  });

  it('works with objects having additional properties', () => {
    const entries = [PIKACHU.name, CHARMANDER.name, PIKACHU.name]; // Duplicate with different properties
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(2);
    expect(result.get(PIKACHU.name)).toBe(0); // First pikachu's index
    expect(result.get(CHARMANDER.name)).toBe(1);
  });

  it('handles empty strings correctly', () => {
    const entries = ['', PIKACHU.name, '', CHARMANDER.name];
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(3);
    expect(result.get('')).toBe(0); // Empty string gets index 0
    expect(result.get(PIKACHU.name)).toBe(1);
    expect(result.get(CHARMANDER.name)).toBe(2);
  });

  it('handles single element array', () => {
    const entries = [PIKACHU.name];
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(1);
    expect(result.get(PIKACHU.name)).toBe(0);
  });

  it('handles strings with special characters and spaces', () => {
    const entries = ['Pokémon-1', 'Pokémon 2', 'Test_Pokémon!', 'Pokémon-1']; // Duplicate with special chars
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(3);
    expect(result.get('Pokémon-1')).toBe(0);
    expect(result.get('Pokémon 2')).toBe(1);
    expect(result.get('Test_Pokémon!')).toBe(2);
  });

  it('maintains order for complex duplicate scenarios', () => {
    const entries = ['A', 'B', 'C', 'A', 'D', 'B', 'E', 'A', 'F'];
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(6); // A, B, C, D, E, F
    expect(result.get('A')).toBe(0); // First A
    expect(result.get('B')).toBe(1); // First B
    expect(result.get('C')).toBe(2);
    expect(result.get('D')).toBe(3);
    expect(result.get('E')).toBe(4);
    expect(result.get('F')).toBe(5);
  });

  it('handles case-sensitive duplicates correctly', () => {
    const entries = ['pikachu', 'PIKACHU', 'Pikachu', 'pikachu'];
    const result = createTierlistIndex(entries);

    expect(result.size).toBe(3); // All three variants are different
    expect(result.get('pikachu')).toBe(0);
    expect(result.get('PIKACHU')).toBe(1);
    expect(result.get('Pikachu')).toBe(2);
  });

  it('handles large arrays efficiently', () => {
    // Generate a large array with duplicates
    const entries: string[] = [];
    for (let i = 0; i < 1000; i++) {
      entries.push(`pokemon_${i % 100}`); // Creates duplicates every 100 entries
    }

    const result = createTierlistIndex(entries);

    expect(result.size).toBe(100); // Only 100 unique entries
    expect(result.get('pokemon_0')).toBe(0);
    expect(result.get('pokemon_50')).toBe(50);
    expect(result.get('pokemon_99')).toBe(99);
  });
});
