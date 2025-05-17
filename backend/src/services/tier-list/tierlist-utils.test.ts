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
});
