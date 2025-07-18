import { ModifiedMainskill } from '../mainskill';
import { IngredientMagnetS } from './ingredient-magnet-s';

export const IngredientMagnetSPlus = new (class extends ModifiedMainskill {
  baseSkill = IngredientMagnetS;
  modifierName = 'Plus';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [5, 7, 9, 11, 13, 16, 18];
  bonusIngredientAmounts = [6, 7, 8, 9, 10, 11, 12];
  image = 'ingredients';
  description = (skillLevel: number) =>
    `Gets you ${this.ingredientAmounts[skillLevel - 1]} ingredients chosen at random. Meet certain conditions to get an additional Rousing Coffee ×${this.bonusIngredientAmounts[skillLevel - 1]}`;
  fullDescription = (skillLevel: number) =>
    `Gets you ${this.ingredientAmounts[skillLevel - 1]} ingredients chosen at random. If there's one or more other Pokémon on the team with the Plus or Minus main skills, gets an additional Rousing Coffee × ${this.bonusIngredientAmounts[skillLevel - 1]}.`;

  activations = {
    solo: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    paired: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.bonusIngredientAmounts)
    }
  };
})(true);
