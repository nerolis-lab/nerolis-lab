import { describe, expect, it } from 'vitest';
import { PINSIR } from '../../types/pokemon';
import { mockIngredient, mockIngredientSet, mockPokemon } from '../../vitest/mocks';
import { getPokemon, hashPokemonWithIngredients } from './pokemon-utils';

describe('getPokemon', () => {
  it('shall return PINSIR for pinSIr name', () => {
    expect(getPokemon('pinSIr')).toBe(PINSIR);
  });

  it("shall throw if Pokémon can't be found", () => {
    expect(() => getPokemon('missing')).toThrow(Error);
  });
});

describe('hashPokemonWithIngredients', () => {
  it('shall return a string', () => {
    expect(
      hashPokemonWithIngredients({
        pokemon: mockPokemon({ name: 'Timmy' }),
        ingredientList: [mockIngredientSet({ ingredient: mockIngredient({ name: 'fruitas' }) })]
      })
    ).toBe('Timmy:fruitas');
  });

  it('shall return a string with multiple ingredients', () => {
    expect(
      hashPokemonWithIngredients({
        pokemon: mockPokemon({ name: 'Timmy' }),
        ingredientList: [
          mockIngredientSet({ ingredient: mockIngredient({ name: 'fruitas' }) }),
          mockIngredientSet({ ingredient: mockIngredient({ name: 'fruitas' }) })
        ]
      })
    ).toBe('Timmy:fruitas,fruitas');
  });

  it('shall handle string pokemon and simple ingredient list', () => {
    expect(
      hashPokemonWithIngredients({
        pokemon: 'Timmytom',
        ingredientList: [{ name: 'apples' }, { name: 'bananas' }]
      })
    ).toBe('Timmytom:apples,bananas');
  });
});
