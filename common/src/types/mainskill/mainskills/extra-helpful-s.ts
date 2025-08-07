import { Mainskill } from '../mainskill';

export const ExtraHelpfulS = new (class extends Mainskill {
  name = 'Extra Helpful S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  helpAmounts = [6, 7, 8, 9, 10, 11, 12];
  image = 'helps';
  description = (skillLevel: number) =>
    `Instantly gets you ×${this.helpAmounts[skillLevel - 1]} the usual help from a helper Pokémon.`;
  activations = {
    helps: {
      unit: 'helps',
      amount: this.leveledAmount(this.helpAmounts)
    }
  };
})(true);
