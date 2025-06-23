import { Mainskill } from '../mainskill';

export const BerryBurst = new (class extends Mainskill {
  name = 'Berry Burst';
  RP = [1400, 1991, 2747, 3791, 5234, 7232];
  selfBerryAmounts = [11, 14, 21, 24, 27, 30];
  teamBerryAmounts = [1, 2, 2, 3, 4, 5];
  image = 'berries';
  description = (skillLevel: number) =>
    `Gets ${this.selfBerryAmounts[skillLevel - 1]} Berries plus ${this.teamBerryAmounts[skillLevel - 1]} of each of the Berries other Pokémon on your team collect.`;

  activations = {
    berries: {
      unit: 'berries',
      amount: this.leveledAmount(this.selfBerryAmounts),
      teamAmount: this.leveledAmount(this.teamBerryAmounts)
    }
  };
})();
