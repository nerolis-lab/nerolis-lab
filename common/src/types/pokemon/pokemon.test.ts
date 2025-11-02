import { describe, expect, it } from 'vitest';
import type { Pokemon } from './pokemon';
import { COMPLETE_POKEDEX } from './pokemon';

describe('remainingEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeLessThanOrEqual(2);
    });
  });
});

describe('previousEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeLessThanOrEqual(2);
    });
  });
});

describe('COMPLETE_POKEDEX', () => {
  COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
    it(`shall not change ${pokemon.name} unexpectedly`, () => {
      expect(pokemon).toMatchSnapshot();
    });
  });

  it('shall include matching evolution references', () => {
    COMPLETE_POKEDEX.forEach((baseMon: Pokemon) => {
      if (baseMon.evolvesFrom === undefined) {
        return;
      }
      const previousForm = COMPLETE_POKEDEX.find((mon: Pokemon) => mon.name === baseMon.evolvesFrom);
      expect(previousForm.evolvesInto).toContain(baseMon.name);
    });
    COMPLETE_POKEDEX.forEach((baseMon: Pokemon) => {
      baseMon.evolvesInto.forEach((evolvedFormName: string) => {
        const evolvedForm = COMPLETE_POKEDEX.find((mon: Pokemon) => mon.name === evolvedFormName);
        expect(evolvedForm.evolvesFrom).toBe(baseMon.name);
      });
    });
  });
});
