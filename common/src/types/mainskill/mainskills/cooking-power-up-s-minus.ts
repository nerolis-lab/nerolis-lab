import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { CookingPowerUpS } from './cooking-power-up-s';

export const CookingPowerUpSMinus = new (class extends ModifiedMainskill {
  baseSkill = CookingPowerUpS;
  modifierName = 'Minus';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  potSizeAmounts = [5, 7, 9, 12, 16, 20, 24];
  energyAmounts = [8, 10, 13, 17, 23, 30, 35];
  image = 'pot';
  description = (params: AmountParams) =>
    `Gives your cooking pot room for ${this.potSizeAmounts[params.skillLevel - 1]} more ingredients next time you cook. Meet certain conditions to also restore ${this.energyAmounts[params.skillLevel - 1]} Energy to one random Pokémon on your team.`;
  fullDescription = (params: AmountParams) =>
    `Gives your cooking pot room for ${this.potSizeAmounts[params.skillLevel - 1]} more ingredients next time you cook. If there's one or more other Pokémon on the team with the Plus or Minus main skills, also restores ${this.energyAmounts[params.skillLevel - 1]} Energy to one random Pokémon on your team.`;

  activations = {
    solo: {
      unit: 'pot size',
      amount: this.leveledAmount(this.potSizeAmounts)
    },
    paired: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts),
      targetLowestChance: 0.5 // unverified
    }
  };
})(true);
