import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { EnergizingCheerS } from './energizing-cheer-s';

export const EnergizingCheerSHealPulse = new (class extends ModifiedMainskill {
  baseSkill = EnergizingCheerS;
  modifierName = 'Heal Pulse';
  RP = [1600, 2300, 3180, 4417, 6113, 8462];
  energyAmounts = [6, 8, 10, 13, 17, 22];
  helpsAmounts = [1, 2, 2, 3, 4, 4];
  latiosHelpsAmounts = [1, 1, 2, 2, 2, 3];
  image = 'energy';
  numMonsTargeted = 2;
  chanceToTargetLowestMembers = 0;

  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to two random Pokémon on your team and instantly gets you ×${this.helpsAmounts[params.skillLevel - 1]} the usual help from those Pokémon. Meet certain conditions to boost effect.`;

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts)
    },
    extraHelps: {
      unit: 'helps',
      amount: this.leveledAmount(this.helpsAmounts)
    }
  };
})(true);
