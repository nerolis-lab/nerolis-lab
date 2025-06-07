import { Mainskill } from '../mainskill';

export const ChargeStrengthM = new (class extends Mainskill {
  name = 'Charge Strength M';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  strengthAmounts = [880, 1251, 1726, 2383, 3290, 4546, 6409];
  image = 'strength';
  description = (skillLevel: number) => `Increases Snorlax's Strength by ${this.strengthAmounts[skillLevel - 1]}.`;
  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})();
