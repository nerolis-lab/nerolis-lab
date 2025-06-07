import { Mainskill } from '../mainskill';

export const ChargeStrengthS = new (class extends Mainskill {
  name = 'Charge Strength S';
  RP = [400, 569, 785, 1083, 1496, 2066, 2656];
  strengthAmounts = [400, 569, 785, 1083, 1496, 2066, 3002];
  image = 'strength';
  description = (skillLevel: number) => `Increases Snorlax's Strength by ${this.strengthAmounts[skillLevel - 1]}.`;

  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})();

export const ChargeStrengthSRange = new (class extends Mainskill {
  name = 'Charge Strength S Range';
  RP = [400, 569, 785, 1083, 1496, 2066, 2656];
  strengthAmounts = [500, 711.25, 981.25, 1353.75, 1870, 2582.5, 3752.5];
  image = 'strength';
  description = (skillLevel: number) =>
    `Increases Snorlax's Strength on average by ${this.strengthAmounts[skillLevel - 1]}.`;
  activations = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})();
