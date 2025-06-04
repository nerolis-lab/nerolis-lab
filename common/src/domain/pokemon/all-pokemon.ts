import { toSeconds } from '../../utils/time-utils/frequency-utils';
import { WIKI } from '../berry/berries';
import { GENDER_UNKNOWN } from '../gender';
import { BEAN_SAUSAGE } from '../ingredient/ingredients';
import { CHARGE_STRENGTH_M_BAD_DREAMS } from '../mainskill/mainskills/charge-strength-m-bad-dreams';
import type { Pokemon } from './pokemon';

export const DARKRAI: Pokemon = {
  name: 'DARKRAI',
  displayName: 'Darkrai',
  pokedexNumber: 491,
  specialty: 'all',
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 19.2,
  skillPercentage: 2.3,
  berry: WIKI,
  genders: GENDER_UNKNOWN,
  carrySize: 28,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: BEAN_SAUSAGE }],
  ingredient30: [{ amount: 2, ingredient: BEAN_SAUSAGE }],
  ingredient60: [{ amount: 2, ingredient: BEAN_SAUSAGE }],
  skill: CHARGE_STRENGTH_M_BAD_DREAMS
};

export const OPTIMAL_ALL_SPECIALISTS: Pokemon[] = [DARKRAI];
export const INFERIOR_ALL_SPECIALISTS: Pokemon[] = [];
export const ALL_ALL_SPECIALISTS: Pokemon[] = [...OPTIMAL_ALL_SPECIALISTS, ...INFERIOR_ALL_SPECIALISTS];
