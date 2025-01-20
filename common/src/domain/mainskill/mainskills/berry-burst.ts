import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { MAINSKILLS, METRONOME_SKILLS, createBaseSkill } from '../mainskill';

export const BERRY_BURST: Mainskill = createBaseSkill({
  name: 'Berry Burst',
  amount: [11, 14, 21, 24, 27, 30],
  unit: 'berries',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Gets ? Berries plus ? of each of the Berries other Pokémon on your team collect.',
  RP: [1400, 1991, 2747, 3791, 5234, 7232]
});
export const BERRY_BURST_TEAM_AMOUNT = [1, 2, 2, 3, 4, 5];

MAINSKILLS.push(BERRY_BURST);
METRONOME_SKILLS.push(BERRY_BURST);
