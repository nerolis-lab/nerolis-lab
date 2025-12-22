import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { EnergizingCheerS } from './energizing-cheer-s';

export const EnergizingCheerSNuzzle = new (class extends ModifiedMainskill {
  baseSkill = EnergizingCheerS;
  modifierName = 'Nuzzle';
  RP = [880, 1251, 1726, 2383, 3290, 4546];
  energyAmounts = [9, 12, 16, 20, 27, 35];
  skillHelpsAmounts = [1, 2, 3, 4, 5, 6];
  image = 'energy';

  description = (params: AmountParams) =>
    `Restores ${this.energyAmounts[params.skillLevel - 1]} Energy to one random Pokémon on your team. If you're lucky, that Pokémon will also gain a main skill activation bonus.`;

  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts),
      targetLowestChance: 0.5 // TODO: Research this value
    },
    skillHelps: {
      unit: 'skill helps',
      amount: this.leveledAmount(this.skillHelpsAmounts)
    }
  };
})(true);
