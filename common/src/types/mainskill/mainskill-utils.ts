import type { Mainskill } from './mainskill';
import { CookingPowerUpSMinus, IngredientMagnetSPlusPlusle, IngredientMagnetSPlusToxtricity } from './mainskills';

export function isPlusOrMinus(skill: Mainskill): boolean {
  return skill.is(IngredientMagnetSPlusPlusle, IngredientMagnetSPlusToxtricity, CookingPowerUpSMinus);
}
