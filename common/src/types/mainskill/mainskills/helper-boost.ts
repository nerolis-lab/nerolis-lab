import { Mainskill } from '../mainskill';

export const HelperBoost = new (class extends Mainskill {
  name = 'Helper Boost';
  RP = [2800, 3902, 5273, 6975, 9317, 12438];
  image = 'helps';

  readonly baseAmounts: number[] = [2, 3, 3, 4, 4, 5];
  readonly uniqueBoostTable: Record<number, number[]> = {
    1: [0, 0, 0, 0, 0, 0], // unique: 1
    2: [0, 0, 0, 0, 1, 1], // unique: 2
    3: [1, 1, 2, 2, 3, 3], // unique: 3
    4: [2, 2, 3, 3, 4, 4], // unique: 4
    5: [4, 4, 5, 5, 6, 6] // unique: 5
  };

  description = (skillLevel: number, extra?: number) =>
    extra === undefined
      ? `Instantly gets you ×${this.baseAmounts[skillLevel - 1]} the usual help from all Pokémon on your team. Meet certain conditions to boost effect.`
      : `Instantly gets you ×${this.getHelps(skillLevel, extra)} the usual help from all Pokémon on your team.`;

  activations = {
    helps: {
      unit: 'helps',
      amount: (skillLevel: number, unique?: number) => this.getHelps(skillLevel, unique ?? 1)
    }
  };

  getHelps(skillLevel: number, unique: number): number {
    return this.baseAmounts[skillLevel - 1] + this.uniqueBoostTable[unique][skillLevel - 1];
  }
})(true);
