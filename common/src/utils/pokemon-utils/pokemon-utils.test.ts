import { describe, expect, it } from 'vitest';
import { PINSIR } from '../../types/pokemon';
import { getPokemon } from './pokemon-utils';

describe('getPokemon', () => {
  it('shall return PINSIR for pinSIr name', () => {
    expect(getPokemon('pinSIr')).toBe(PINSIR);
  });

  it("shall throw if Pokémon can't be found", () => {
    expect(() => getPokemon('missing')).toThrow(Error);
  });
});
