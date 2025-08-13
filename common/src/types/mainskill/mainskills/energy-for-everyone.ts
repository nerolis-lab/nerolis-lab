import type { AmountParams } from '../mainskill';
import { Mainskill } from '../mainskill';

export const EnergyForEveryone = new (class extends Mainskill {
  name = 'Energy For Everyone';
  RP = [1120, 1593, 2197, 3033, 4187, 5785];
  energyAmounts = [5, 7, 9, 11.4, 15, 18.1];
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to each helper Pokémon on your team.`;
  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    }
  };
})(true);
