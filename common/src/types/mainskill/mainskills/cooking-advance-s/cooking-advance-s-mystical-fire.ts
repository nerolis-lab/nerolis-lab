import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { CookingAdvanceS } from './cooking-advance-s';

export const CookingAdvanceSMysticalFire = new (class extends ModifiedMainskill {
  baseSkill = CookingAdvanceS;
  modifierName = 'Mystical Fire';
  RP = [1144, 1626, 2244, 3098, 4277, 5910, 7596];
  potAmounts = [7, 10, 12, 17, 22, 27, 31];
  tastyAmounts = [1, 2, 2, 3, 3, 4, 5];
  image = 'cookingadvance';
  description = (params: AmountParams) =>
    `Gives your pot room for ${this.potAmounts[params.skillLevel - 1]} more ingredients the next time you cook. Also raises your Extra Tasty rate by ${this.tastyAmounts[params.skillLevel - 1]}%.`;
  activations: ActivationsType = {
    potSize: {
      unit: 'pot size',
      amount: this.leveledAmount(this.potAmounts)
    },
    tastyChance: {
      unit: 'crit chance',
      amount: this.leveledAmount(this.tastyAmounts)
    }
  };
})(true);
