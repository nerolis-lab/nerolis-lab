import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';
import type { MainskillTargeting } from '../../mainskill-targeting';

export const EnergizingCheerS = new (class extends Mainskill {
  name = 'Energizing Cheer S';
  RP = [766, 1089, 1502, 2074, 2863, 3956];
  energyAmounts = [12, 15, 20, 25, 33, 44];
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to one random Pokémon on your team.`;

  targeting: MainskillTargeting = {
    numMonsTargeted: 1,
    chanceToTargetLowestMembers: 0.5
  };

  activations: ActivationsType = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    }
  };
})(true);
