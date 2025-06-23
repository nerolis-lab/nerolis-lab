import { Mainskill } from '../mainskill';

export const EnergizingCheerS = new (class extends Mainskill {
  name = 'Energizing Cheer S';
  RP = [880, 1251, 1726, 2383, 3290, 4546];
  energyAmounts = [14, 17.1, 22.5, 28.8, 38.2, 50.6];
  image = 'energy';
  description = (skillLevel: number) =>
    `Restores ${this.energyAmounts[skillLevel - 1]} Energy to one random Pokémon on your team.`;
  activations = {
    energy: {
      unit: 'energy',
      amount: this.leveledAmount(this.energyAmounts),
      targetLowestChance: 0.5
    }
  };
})(true);
