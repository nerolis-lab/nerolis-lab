import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';

export const CookingAdvanceS = new (class extends Mainskill {
  name = 'Cooking Advance S';
  RP = [0];
  image = 'ingredients';
  description = (_: AmountParams) => `Stub skill that doesn't exist.`;
  activations: ActivationsType = {};
})(false, true);
