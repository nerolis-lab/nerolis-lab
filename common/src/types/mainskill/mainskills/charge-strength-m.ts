import type { AmountParams } from '../mainskill';
import { Mainskill } from '../mainskill';

export const ChargeStrengthM = new (class extends Mainskill {
  name = 'Charge Strength M';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  strengthAmounts = [880, 1251, 1726, 2383, 3290, 4546, 6409];
  image = 'strength';
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength by ${this.strengthAmounts[params.skillLevel - 1]}.`;
  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})();
