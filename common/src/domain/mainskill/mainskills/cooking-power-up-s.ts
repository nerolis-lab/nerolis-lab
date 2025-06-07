import { Mainskill } from '../mainskill';

export const CookingPowerUpS = new (class extends Mainskill {
  name = 'Cooking Power-Up S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  potSizeAmounts = [7, 10, 12, 17, 22, 27, 31];
  image = 'pot';
  description = (skillLevel: number) =>
    `Increases the quantity of Cooking items you get by ${this.potSizeAmounts[skillLevel - 1]}.`;
  activations = {
    potSize: {
      unit: 'cooking',
      amount: this.leveledAmount(this.potSizeAmounts)
    }
  };
})();
