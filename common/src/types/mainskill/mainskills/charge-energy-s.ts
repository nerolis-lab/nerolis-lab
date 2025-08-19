import type { AmountParams } from '../mainskill';
import { Mainskill } from '../mainskill';

export const ChargeEnergyS = new (class extends Mainskill {
  name = 'Charge Energy S';
  energyAmounts = [12, 16.2, 21.2, 26.6, 33.6, 43.4];
  image = 'energy';
  description = (params: AmountParams) => `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to the user.`;
  RP = [400, 569, 785, 1083, 1496, 2066];

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    }
  };
})();
