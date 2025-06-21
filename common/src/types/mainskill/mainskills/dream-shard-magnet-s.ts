import { Mainskill } from '../mainskill';

export const DreamShardMagnetS = new (class extends Mainskill {
  name = 'Dream Shard Magnet S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303];
  shardAmounts = [240, 340, 480, 670, 920, 1260, 1800, 2500];
  image = 'shards';

  description = (skillLevel: number) => `Obtain ${this.shardAmounts[skillLevel - 1]} Dream Shards.`;
  activations = {
    dreamShards: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmounts)
    }
  };
})();

export const DreamShardMagnetSRange = new (class extends Mainskill {
  name = 'Dream Shard Magnet S Range';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303];
  shardAmounts = [300, 425, 600, 837.5, 1150, 1575, 2250, 3125];
  image = 'shards';
  description = (skillLevel: number) => `Obtain ${this.shardAmounts[skillLevel - 1]} Dream Shards on average.`;
  activations = {
    dreamShards: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmounts)
    }
  };
})();
