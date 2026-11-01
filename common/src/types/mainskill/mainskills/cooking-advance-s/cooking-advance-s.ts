import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';

export const CookingAdvanceS = new (class extends Mainskill {
  name = 'Cooking Advance S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843]; // TODO: verify the estimate from Cooking Power-Up S.
  potSizeAmounts = [7, 10, 12, 17, 22, 27, 31];
  image = 'pot';
  description = (params: AmountParams) =>
    `Gives your pot room for ${this.potSizeAmounts[params.skillLevel - 1]} more ingredients next time you cook.`;
  activations: ActivationsType = {
    potSize: {
      unit: 'pot size',
      amount: this.leveledAmount(this.potSizeAmounts)
    }
  };
})();
