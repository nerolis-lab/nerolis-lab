import { Mainskill, type ActivationsType, type AmountParams } from '../../mainskill';
import type { MainskillTargeting } from '../../mainskill-targeting';

export const Versatile = new (class extends Mainskill {
  name = 'Versatile';
  modifierName = 'Present';
  RP = [1, 2, 3, 4, 5, 6, 7, 8];
  candyAmount = 1;
  bonusCandyAmount = [0, 0, 0, 0, 0, 1, 2, 3];
  bonusCandyChance = 0.3;
  image = 'ingredients';
  description = (params: AmountParams) => {
    const bonusCandyAmount = this.bonusCandyAmount[params.skillLevel - 1];
    const totalCandyAmount = bonusCandyAmount > 0 ? `either 1 or ${1 + bonusCandyAmount} candies` : '1 candy';
    return `Gets ${totalCandyAmount} for one Pokémon on your team. Other effects are not yet implemented in Neroli's Lab.`;
  };

  targeting: MainskillTargeting = {
    numMonsTargeted: 1,
    chanceToTargetLowestMembers: 0
  };

  activations: ActivationsType = {
    candy: {
      unit: 'candy',
      amount: () => this.candyAmount,
      critAmount: this.leveledAmount(this.bonusCandyAmount)
    }
  };
})();
