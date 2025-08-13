import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { ChargeStrengthS } from './charge-strength-s';

export const ChargeStrengthSStockpile = new (class extends ModifiedMainskill {
  baseSkill = ChargeStrengthS;
  modifierName = 'Stockpile';
  RP = [600, 853, 1177, 1625, 2243, 3099, 3984];
  averageStrengthAmounts = [600, 853, 1177, 1625, 2243, 3099, 4497];
  image = 'stockpile_strength';
  readonly spitUpAmounts: Record<number, number[]> = {
    1: [600, 1020, 1500, 2040, 2640, 3300, 4020, 4920, 6180, 7980, 10980],
    2: [853, 1450, 2132, 2900, 3753, 4691, 5715, 6995, 8786, 11345, 15610],
    3: [1177, 2001, 2943, 4002, 5179, 6474, 7886, 9652, 12124, 15655, 21540],
    4: [1625, 2763, 4063, 5526, 7151, 8939, 10889, 13327, 16740, 21615, 29740],
    5: [2243, 3813, 5607, 7626, 9869, 12336, 15028, 18393, 23103, 29832, 41047],
    6: [3099, 5268, 7747, 10536, 13635, 17044, 20763, 25412, 31920, 41217, 56712],
    7: [4502, 7653, 11255, 15307, 19809, 24761, 30163, 36916, 46370, 59876, 82386]
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description = (params: AmountParams) =>
    `Stockpile or Spit Up is selected. When Spit Up triggers, Snorlax gains Strength from Stockpile's number.`;

  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.averageStrengthAmounts),
      critChance: 0.2674
    }
  };

  getSpitUpStrength(skillLevel: number): number[] {
    return this.spitUpAmounts[skillLevel];
  }
})();
