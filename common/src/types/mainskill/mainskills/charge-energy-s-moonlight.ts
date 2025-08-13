import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { ChargeEnergyS } from './charge-energy-s';

export const ChargeEnergySMoonlight = new (class extends ModifiedMainskill {
  baseSkill = ChargeEnergyS;
  modifierName = 'Moonlight';
  energyAmounts = [12, 16.2, 21.2, 26.6, 33.6, 43.4];
  critAmounts = [6.3, 7.7, 10.1, 13.0, 17.2, 22.8];
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to the user. Has a chance of restoring ${this.critAmounts[params.skillLevel - 1]} energy to another Pokémon.`;
  RP = [560, 797, 1099, 1516, 2094, 2892];

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts),
      critChance: 0.5,
      critAmount: this.leveledAmount(this.critAmounts)
    }
  };
})(true);
