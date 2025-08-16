import type { Ingredient } from '../../ingredient';
import { MOOMOO_MILK, ROUSING_COFFEE } from '../../ingredient/ingredients';
import type { AmountParams } from '../mainskill';
import { ModifiedMainskill } from '../mainskill';
import { IngredientMagnetS } from './ingredient-magnet-s';

export const IngredientMagnetSPlus = new (class extends ModifiedMainskill {
  baseSkill = IngredientMagnetS;
  modifierName = 'Plus';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  ingredientAmounts = [5, 7, 9, 11, 13, 16, 18];

  bonusIngredientAmounts = new Map<Ingredient['name'], number[]>([
    [ROUSING_COFFEE.name, [6, 7, 8, 9, 10, 11, 12]],
    [MOOMOO_MILK.name, [6, 7, 9, 10, 12, 13, 14]]
  ]);

  image = 'ingredients';
  description = (params: AmountParams) => {
    const { skillLevel, ingredient } = params;
    const bonusAmount = this.getBonusAmount(params);
    const ingredientName = ingredient?.name;

    return `Gets you ${this.ingredientAmounts[skillLevel - 1]} ingredients chosen at random. 
    Meet certain conditions to get an additional ${bonusAmount} ${ingredientName}s`;
  };
  fullDescription = (params: AmountParams) => {
    const { skillLevel, ingredient } = params;
    const bonusAmount = this.getBonusAmount(params);
    const ingredientName = ingredient?.name ?? 'ingredients';

    return `Gets you ${this.ingredientAmounts[skillLevel - 1]} ingredients chosen at random. 
    If there's one or more other Pokémon on the team with the Plus or Minus main skills, 
    gets an additional ${ingredientName} x ${bonusAmount}.`;
  };

  activations = {
    solo: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts)
    },
    paired: {
      unit: 'ingredients',
      amount: (params: AmountParams) => this.getBonusAmount(params)
    }
  };

  getBonusAmount(params: AmountParams): number {
    const { skillLevel, ingredient } = params;
    if (!ingredient) return 0;

    const amounts = this.bonusIngredientAmounts.get(ingredient.name);
    return amounts?.at(skillLevel - 1) ?? 0;
  }
})(true);
