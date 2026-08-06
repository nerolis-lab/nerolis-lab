import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { DreamShardMagnetS } from './dream-shard-magnet-s';

export const DreamShardMagnetSAuraSphere = new (class extends ModifiedMainskill {
  baseSkill = DreamShardMagnetS;
  modifierName = 'Aura Sphere';
  RP = [1040, 1479, 2040, 2816, 3888, 5372, 6905, 8543];
  shardAmounts = [240, 340, 480, 670, 920, 1260, 1800, 2500];
  strengthAmounts = [200, 285, 393, 542, 748, 1033, 1501, 2042];
  image = 'shards';

  description = (params: AmountParams) =>
    `Obtain ${this.shardAmounts[params.skillLevel - 1]} Dream Shards. Also increases Snorlax's Strength by ${this.strengthAmounts[params.skillLevel - 1]}.`;
  activations: ActivationsType = {
    dreamShards: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmounts)
    },
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})(true);
