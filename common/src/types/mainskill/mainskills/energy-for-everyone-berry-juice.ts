import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { EnergyForEveryone } from './energy-for-everyone';

export const EnergyForEveryoneBerryJuice = new (class extends ModifiedMainskill {
  baseSkill = EnergyForEveryone;
  modifierName = 'Berry Juice';
  energyAmounts = [5, 7, 9, 11.4, 15, 18.1];
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to all helper Pokémon on your team. Sometimes additionally gets you a Berry Juice.`;
  RP = [1220, 1735, 2392, 3303, 4559, 6299];

  juicePercent: number = 0; // TODO: Replace once real numbers are known.
  juiceAmount: number = 1;

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
