import { BELUE } from '../../../types/berry/berries';
import { BALANCED_GENDER } from '../../../types/gender/gender';
import { SLOWPOKE_TAIL } from '../../../types/ingredient/ingredients';
import type { AmountParams } from '../../../types/mainskill/mainskill';
import { Mainskill } from '../../../types/mainskill/mainskill';
import type { Pokemon } from '../../../types/pokemon/pokemon';

export const mockMainskill = new (class extends Mainskill {
  name = 'mock skill';
  description = (params: AmountParams) => `mock skill with level ${params.skillLevel}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  amount = (skillLevel: number) => 0;
  RP = [0];
  unit = 'mock unit';
  activations = {};
  image = 'mock';
})(false, true);

export function mockPokemon(attrs?: Partial<Pokemon>): Pokemon {
  return {
    name: 'MOCKEMON',
    displayName: 'Mockemon',
    pokedexNumber: 0,
    specialty: 'berry',
    frequency: 0,
    ingredientPercentage: 0,
    skillPercentage: 0,
    berry: BELUE,
    genders: BALANCED_GENDER,
    carrySize: 0,
    previousEvolutions: 0,
    remainingEvolutions: 0,
    ingredient0: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    skill: mockMainskill,
    ...attrs
  };
}
