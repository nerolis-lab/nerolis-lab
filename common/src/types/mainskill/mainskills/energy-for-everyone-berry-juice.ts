import type { AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { EnergyForEveryone } from './energy-for-everyone';

export const EnergyForEveryoneBerryJuice = new (class extends ModifiedMainskill {
  baseSkill = EnergyForEveryone;
  modifierName = 'Berry Juice';
  energyAmounts = [5, 7, 9, 11.4, 15, 18.1]; // TODO: Replace once real numbers are known.
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to all helper Pokémon on your team. Sometimes additionally gets you a Berry Juice.`;
  RP = [1400, 1991, 2747, 3791, 5234, 7232]; // TODO: Confirm once real numbers are known.

  juicePercent: number = 0.5; // TODO: Replace once real numbers are known.
  juiceAmount: number = 1; // TODO: Confirm once real numbers are known.

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    },
    juice: {
      unit: 'items',
      amount: () => 1
    }
  };
})(true);
