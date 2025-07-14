import { createAllSpecialist } from '../../utils/pokemon-utils/pokemon-constructors';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
import { WIKI } from '../berry/berries';
import { GENDER_UNKNOWN } from '../gender';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FIERY_HERB,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LOCKED_INGREDIENT,
  MOOMOO_MILK,
  ROUSING_COFFEE
} from '../ingredient/ingredients';
import { ChargeStrengthMBadDreams } from '../mainskill/mainskills/charge-strength-m-bad-dreams';
import type { Pokemon } from './pokemon';

export const DARKRAI: Pokemon = createAllSpecialist({
  name: 'DARKRAI',
  displayName: 'Darkrai',
  pokedexNumber: 491,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 19.2,
  skillPercentage: 2.3,
  berry: WIKI,
  genders: GENDER_UNKNOWN,
  carrySize: 28,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    ingredient0: [
      { amount: 2, ingredient: BEAN_SAUSAGE },
      { amount: 2, ingredient: FANCY_APPLE },
      { amount: 2, ingredient: FIERY_HERB },
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 2, ingredient: HONEY },
      { amount: 2, ingredient: GREENGRASS_SOYBEANS },
      { amount: 2, ingredient: GREENGRASS_CORN },
      { amount: 2, ingredient: ROUSING_COFFEE }
    ],
    ingredient30: [
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 4, ingredient: BEAN_SAUSAGE },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 3, ingredient: FIERY_HERB },
      { amount: 4, ingredient: MOOMOO_MILK },
      { amount: 4, ingredient: HONEY },
      { amount: 4, ingredient: GREENGRASS_SOYBEANS },
      { amount: 3, ingredient: GREENGRASS_CORN },
      { amount: 3, ingredient: ROUSING_COFFEE }
    ],
    ingredient60: [
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 6, ingredient: BEAN_SAUSAGE },
      { amount: 7, ingredient: FANCY_APPLE },
      { amount: 5, ingredient: FIERY_HERB },
      { amount: 6, ingredient: MOOMOO_MILK },
      { amount: 6, ingredient: HONEY },
      { amount: 6, ingredient: GREENGRASS_SOYBEANS },
      { amount: 4, ingredient: GREENGRASS_CORN },
      { amount: 4, ingredient: ROUSING_COFFEE }
    ]
  },
  skill: ChargeStrengthMBadDreams
});

export const OPTIMAL_ALL_SPECIALISTS: Pokemon[] = [DARKRAI];
export const INFERIOR_ALL_SPECIALISTS: Pokemon[] = [];
export const ALL_ALL_SPECIALISTS: Pokemon[] = [...OPTIMAL_ALL_SPECIALISTS, ...INFERIOR_ALL_SPECIALISTS];
