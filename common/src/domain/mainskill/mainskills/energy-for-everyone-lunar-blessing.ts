import type { Mainskill } from '../mainskill';
import { INGREDIENT_SUPPORT_MAINSKILLS, MAINSKILLS } from '../mainskill';
import { LunarBlessing } from '../modifier';
import { ENERGY_FOR_EVERYONE } from './energy-for-everyone';

const critChance = 0;
export const ENERGY_FOR_EVERYONE_LUNAR_BLESSING: Mainskill = LunarBlessing(ENERGY_FOR_EVERYONE, critChance, {
  amount: [3, 4, 5, 7, 9, 11],
  description:
    'Restores some Energy to all helper Pokémon on your team plus gives ? of each of the Berries other Pokémon on your team collect.',
  RP: [1400, 1991, 2747, 3791, 5234, 7232]
});

export const LUNAR_BLESSING_SELF_BERRIES: number[][] = [
  // Skill level 1 to 6
  [5, 9, 13, 17, 21, 25], // unique: 1
  [7, 12, 17, 19, 24, 29], // unique: 2
  [9, 15, 18, 25, 27, 30], // unique: 3
  [12, 16, 20, 28, 28, 31], // unique: 4
  [14, 19, 24, 29, 30, 32] // unique: 5
];

export const LUNAR_BLESSING_TEAM_BERRIES: number[][] = [
  // Skill level 1 to 6
  [1, 1, 1, 1, 1, 1], // unique: 1
  [1, 1, 1, 2, 2, 2], // unique: 2
  [1, 1, 2, 2, 3, 4], // unique: 3
  [1, 2, 3, 3, 5, 6], // unique: 4
  [2, 3, 4, 5, 7, 9] // unique: 5
];

MAINSKILLS.push(ENERGY_FOR_EVERYONE_LUNAR_BLESSING);
// METRONOME_SKILLS.push(ENERGY_FOR_EVERYONE_LUNAR_BLESSING); // TODO: maybe?
INGREDIENT_SUPPORT_MAINSKILLS.push(ENERGY_FOR_EVERYONE_LUNAR_BLESSING);
