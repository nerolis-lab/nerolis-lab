import type { Mainskill } from '../mainskill';
import { MAINSKILLS, METRONOME_SKILLS, createBaseSkill } from '../mainskill';

export const DREAM_SHARD_MAGNET_S: Mainskill = createBaseSkill({
  name: 'Dream Shard Magnet S',
  amount: [240, 340, 480, 670, 920, 1260, 1800, 2500],
  unit: 'dream shards',
  maxLevel: 8,
  description: 'Obtain ? Dream Shards.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303]
});

export const DREAM_SHARD_MAGNET_S_RANGE: Mainskill = createBaseSkill({
  name: 'Dream Shard Magnet S Range',
  amount: [
    (DREAM_SHARD_MAGNET_S.amounts[0] * 2 + DREAM_SHARD_MAGNET_S.amounts[0] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[1] * 2 + DREAM_SHARD_MAGNET_S.amounts[1] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[2] * 2 + DREAM_SHARD_MAGNET_S.amounts[2] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[3] * 2 + DREAM_SHARD_MAGNET_S.amounts[3] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[4] * 2 + DREAM_SHARD_MAGNET_S.amounts[4] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[5] * 2 + DREAM_SHARD_MAGNET_S.amounts[5] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[6] * 2 + DREAM_SHARD_MAGNET_S.amounts[6] * 0.5) / 2,
    (1150 + 4600) / 2
  ],
  unit: 'dream shards',
  maxLevel: 8,
  description: 'Obtain ? Dream Shards on average.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303]
});

MAINSKILLS.push(DREAM_SHARD_MAGNET_S);
MAINSKILLS.push(DREAM_SHARD_MAGNET_S_RANGE);
METRONOME_SKILLS.push(DREAM_SHARD_MAGNET_S);
METRONOME_SKILLS.push(DREAM_SHARD_MAGNET_S_RANGE);
