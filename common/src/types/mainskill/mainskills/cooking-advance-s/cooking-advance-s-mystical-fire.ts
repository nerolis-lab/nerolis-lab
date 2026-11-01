import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { CookingAdvanceS } from './cooking-advance-s';

export const CookingAdvanceSMysticalFire = new (class extends ModifiedMainskill {
  baseSkill = CookingAdvanceS;
  modifierName = 'Mystical Fire';
  RP = [1144, 1626, 2244, 3098, 4277, 5910, 7596];
  potSizeAmounts = [7, 10, 12, 17, 22, 27, 31];
  chanceAmounts = [1, 2, 2, 3, 3, 4, 5];
  image = 'pot';
  description = (params: AmountParams) =>
    `Gives your pot room for ${this.potSizeAmounts[params.skillLevel - 1]} more ingredients next time you cook. Also raises your Extra Tasty rate by ${this.chanceAmounts[params.skillLevel - 1]}%. The effect lasts until you cook an Extra Tasty dish or change sites.`;

  activations: ActivationsType = {
    potSize: {
      unit: 'pot size',
      amount: this.leveledAmount(this.potSizeAmounts)
    },
    critChance: {
      unit: 'crit chance',
      amount: this.leveledAmount(this.chanceAmounts)
    }
  };
})();
