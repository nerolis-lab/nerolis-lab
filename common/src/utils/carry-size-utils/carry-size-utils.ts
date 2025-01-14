import type { Produce } from '../../api/production/produce';
import type { Pokemon } from '../../domain/pokemon';
import { calculateRibbonCarrySize, calculateSubskillCarrySize } from '../stat-utils/stat-utils';

class CarrySizeUtilsImpl {
  public addToInventory(currentInventory: Produce, produce: Produce): Produce {
    const newInventory: Produce = {
      berries: [...currentInventory.berries],
      ingredients: [...currentInventory.ingredients]
    };

    produce.berries.forEach((produceBerrySet) => {
      if (produceBerrySet.amount > 0) {
        const index = newInventory.berries.findIndex(
          (item) => item.berry.name === produceBerrySet.berry.name && item.level === produceBerrySet.level
        );

        if (index !== -1) {
          newInventory.berries[index] = {
            berry: newInventory.berries[index].berry,
            amount: newInventory.berries[index].amount + produceBerrySet.amount,
            level: newInventory.berries[index].level
          };
        } else {
          newInventory.berries.push({ ...produceBerrySet });
        }
      }
    });

    produce.ingredients.forEach((produceIngredientSet) => {
      if (produceIngredientSet.amount > 0) {
        const index = newInventory.ingredients.findIndex(
          (item) => item.ingredient.name === produceIngredientSet.ingredient.name
        );

        if (index !== -1) {
          newInventory.ingredients[index] = {
            ingredient: newInventory.ingredients[index].ingredient,
            amount: newInventory.ingredients[index].amount + produceIngredientSet.amount
          };
        } else {
          newInventory.ingredients.push({ ...produceIngredientSet });
        }
      }
    });

    return newInventory;
  }

  public countInventory(inventory: Produce) {
    return (
      inventory.berries.reduce((sum, cur) => sum + cur.amount, 0) +
      inventory.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
    );
  }

  public getEmptyInventory(): Produce {
    return {
      berries: [],
      ingredients: []
    };
  }

  public calculateCarrySize(params: {
    baseWithEvolutions: number;
    subskillsLevelLimited: Set<string>;
    ribbon: number;
    camp: boolean;
  }) {
    const { baseWithEvolutions, subskillsLevelLimited, ribbon, camp } = params;
    return Math.ceil(
      (baseWithEvolutions + calculateSubskillCarrySize(subskillsLevelLimited) + calculateRibbonCarrySize(ribbon)) *
        (camp ? 1.2 : 1)
    );
  }

  public timesEvolvedByCarrySize(pokemon: Pokemon, currentBaseCarrySize: number): number {
    return (currentBaseCarrySize - pokemon.carrySize) / 5;
  }

  public baseCarrySize(pokemon: Pokemon, timesEvolved: number): number {
    return pokemon.carrySize + 5 * timesEvolved;
  }

  public maxCarrySize(pokemon: Pokemon): number {
    return pokemon.carrySize + 5 * pokemon.previousEvolutions;
  }
}

export const CarrySizeUtils = new CarrySizeUtilsImpl();
