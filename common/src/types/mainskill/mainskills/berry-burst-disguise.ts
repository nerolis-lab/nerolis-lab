import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { BerryBurst } from './berry-burst';

export const BerryBurstDisguise = new (class extends ModifiedMainskill {
  baseSkill = BerryBurst;
  modifierName = 'Disguise';
  image = 'berries';
  selfBerryAmounts = [8, 10, 15, 17, 19, 21];
  teamBerryAmounts = [1, 2, 2, 3, 4, 5];

  description = (params: AmountParams) =>
    `Gets ${this.selfBerryAmounts[params.skillLevel - 1]} Berries plus ${this.teamBerryAmounts[params.skillLevel - 1]} of each of the Berries other Pokémon on your team collect. May activate Greater Success once a day.`;
  RP = [1400, 1991, 2747, 3791, 5234, 7232];

  activations = {
    berries: {
      unit: 'berries',
      amount: this.leveledAmount(this.selfBerryAmounts),
      teamAmount: this.leveledAmount(this.teamBerryAmounts),
      critChance: 0.185,
      critMultiplier: 3
    }
  };
})();
