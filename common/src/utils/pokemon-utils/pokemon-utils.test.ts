import { describe, expect, it } from 'vitest';
import { mockIngredient, mockIngredientSet, mockPokemon } from '../../vitest/mocks';
import { hashPokemonWithIngredients } from './pokemon-utils';

describe('hashPokemonWithIngredients', () => {
  it('shall return a string', () => {
    expect(
      hashPokemonWithIngredients({
        pokemon: mockPokemon({ name: 'SNEASEL' }),
        ingredientList: [mockIngredientSet({ ingredient: mockIngredient({ name: 'fruitas' }) })]
      })
    ).toBe('Timmy:fruitas');
  });

  it('shall return a string with multiple ingredients', () => {
    expect(
      hashPokemonWithIngredients({
        pokemon: mockPokemon({ name: 'SNEASEL' }),
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
