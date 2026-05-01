import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import type { MainskillTargeting } from '../../mainskill-targeting';
import { ChargeEnergyS } from './charge-energy-s';

export const ChargeEnergySMoonlight = new (class extends ModifiedMainskill {
  baseSkill = ChargeEnergyS;
  modifierName = 'Moonlight';
  energyAmounts = [12, 16.2, 21.2, 26.6, 33.6, 43.4];
  critAmounts = [6.3, 7.7, 10.1, 13.0, 17.2, 22.8];
  critChance = 0.5;
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to the user. Has a chance of restoring ${this.critAmounts[params.skillLevel - 1]} energy to another Pokémon.`;
  RP = [560, 797, 1099, 1516, 2094, 2892];

  targeting: MainskillTargeting = {
    numMonsTargeted: 1,
    chanceToTargetLowestMembers: 0.5
  };

  activations: ActivationsType = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts),
      critAmount: this.leveledAmount(this.critAmounts)
    }
  };
})(true);
