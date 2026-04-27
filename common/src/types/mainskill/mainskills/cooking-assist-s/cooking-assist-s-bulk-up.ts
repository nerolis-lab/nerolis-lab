import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { CookingAssistS } from './cooking-assist-s';

export const CookingAssistSBulkUp = new (class extends ModifiedMainskill {
  baseSkill = CookingAssistS;
  modifierName = 'Bulk Up';
  RP = [1144, 1626, 2244, 3098, 4277, 5910, 7596];
  ingredientAmounts = [6, 8, 11, 14, 17, 21, 24];
  chanceAmounts = [1, 2, 2, 3, 3, 4, 5];
  image = 'ingredients';
  description = (params: AmountParams) =>
    `Gets you ${this.ingredientAmounts[params.skillLevel - 1]} ingredients chosen at random. Also raises your Extra Tasty rate by ${this.chanceAmounts[params.skillLevel - 1]}%. The effect lasts until you cook an Extra Tasty dish or change sites.`;

  activations: ActivationsType = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    critChance: {
      unit: 'crit chance',
      amount: this.leveledAmount(this.chanceAmounts)
    }
  };
})(true);
