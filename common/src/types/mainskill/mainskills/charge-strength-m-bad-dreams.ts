import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { ChargeStrengthM } from './charge-strength-m';

export const ChargeStrengthMBadDreams = new (class extends ModifiedMainskill {
  baseSkill = ChargeStrengthM;
  modifierName = 'Bad Dreams';
  RP = [2400, 3313, 4643, 6441, 8864, 11878];
  strengthAmounts = [2640, 3753, 5178, 7149, 9870, 13638];
  energyReduction = 12;
  image = 'strength';
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength by ${this.strengthAmounts[params.skillLevel - 1]}, but at the same time, reduces the Energy of helper Pokémon on your team that aren't Dark type by ${this.energyReduction}.`;

  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts),
      teamEnergyReduction: this.energyReduction
    }
  };
})();
