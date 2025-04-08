import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { MAINSKILLS } from '../mainskill';
import { BadDreams } from '../modifier';
import { CHARGE_STRENGTH_M } from './charge-strength-m';

const critChance = 0;
export const CHARGE_STRENGTH_M_BAD_DREAMS: Mainskill = BadDreams(CHARGE_STRENGTH_M, critChance, {
  amount: [2640, 3753, 5178, 7149, 9870, 13638],
  maxLevel: MAX_SKILL_LEVEL - 1,
  description:
    "Increases Snorlax's Strength by ?, but at the same time, reduces the Energy of helper Pokémon on your team that aren't Dark type by 12.",
  RP: [2400, 3313, 4643, 6441, 8864, 11878]
});

export const BAD_DREAMS_ENERGY_REDUCTION = 12;

MAINSKILLS.push(CHARGE_STRENGTH_M_BAD_DREAMS);
// METRONOME_SKILLS.push(CHARGE_STRENGTH_M_BAD_DREAMS); // TODO: maybe?
