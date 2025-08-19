import type { AmountParams } from '../mainskill';
import { Mainskill } from '../mainskill';

export const TastyChanceS = new (class extends Mainskill {
  name = 'Tasty Chance S';
  RP = [880, 1251, 1726, 2383, 3290, 4546];
  chanceAmounts = [4, 5, 6, 7, 8, 10];
  image = 'chance';
  description = (params: AmountParams) =>
    `Raises your Extra Tasty rate by ${this.chanceAmounts[params.skillLevel - 1]}%. The effect lasts until you cook an Extra Tasty dish or change sites.`;
  activations = {
    critChance: {
      unit: 'crit chance',
      amount: this.leveledAmount(this.chanceAmounts)
    }
  };
})();
