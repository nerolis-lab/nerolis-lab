import { MAX_TEAM_SIZE } from '../../constants';
import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { EnergyForEveryone } from './energy-for-everyone';

export const EnergyForEveryoneLunarBlessing = new (class extends ModifiedMainskill {
  baseSkill = EnergyForEveryone;
  modifierName = 'Lunar Blessing';
  energyAmounts = [3, 4, 5, 7, 9, 11];
  image = 'energy';
  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to all helper Pokémon on your team plus gives ${this.teamBerries[1][params.skillLevel - 1]} - ${this.selfBerries[MAX_TEAM_SIZE][params.skillLevel - 1]} of each of the Berries other Pokémon on your team collect.`;
  RP = [1400, 1991, 2747, 3791, 5234, 7232];

  readonly selfBerries: Record<number, number[]> = {
    1: [5, 9, 13, 17, 21, 25], // unique: 1
    2: [7, 12, 17, 19, 24, 29], // unique: 2
    3: [9, 15, 18, 25, 27, 30], // unique: 3
    4: [12, 16, 20, 28, 28, 31], // unique: 4
    5: [14, 19, 24, 29, 30, 32] // unique: 5
  };
  readonly teamBerries: Record<number, number[]> = {
    1: [1, 1, 1, 1, 1, 1], // unique: 1
    2: [1, 1, 1, 2, 2, 2], // unique: 2
    3: [1, 1, 2, 2, 3, 4], // unique: 3
    4: [1, 2, 3, 3, 5, 6], // unique: 4
    5: [2, 3, 4, 5, 7, 9] // unique: 5
  };

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    },
    selfBerries: {
      unit: 'berries',
      amount: (params: AmountParams) => this.selfBerries[params.extra ?? 1][params.skillLevel - 1]
    },
    teamBerries: {
      unit: 'berries',
      amount: (params: AmountParams) => this.teamBerries[params.extra ?? 1][params.skillLevel - 1]
    }
  };
})(true);
