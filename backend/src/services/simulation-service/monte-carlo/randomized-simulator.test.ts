import type { PokemonProduce } from '@src/domain/combination/produce.js';
import { randomizedSimulation } from '@src/services/simulation-service/monte-carlo/randomized-simulator.js';
import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults.js';
import { berry, ingredient, nature } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('randomizedSimulation', () => {
  it('shall run basic randomized simulator', () => {
    const result = randomizedSimulation({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      energyFromYesterday: 0,
      nightHelpsBeforeCarryFromYesterday: 0,
      inventoryLimit: 100000, // dont hit limit
      pokemonWithAverageProduce, // average produce doesnt matter, we wont hit limit
      recoveryEvents: [],
      mealTimes: [],
      skillPercentage: 0.2,
      skillLevel: 6,
      maxEnergyRecovery: 100
    });

    expect(result.dayHelps).toBe(102);
    expect(result.nightHelpsBeforeSS).toBe(33);
    expect(result.endingEnergy).toBe(0);
  });

  it('shall return lower night helps for low inventory limit', () => {
    const result = randomizedSimulation({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      energyFromYesterday: 0,
      nightHelpsBeforeCarryFromYesterday: 0,
      inventoryLimit: 5,
      pokemonWithAverageProduce,
      recoveryEvents: [],
      mealTimes: [],
      skillPercentage: 0.2,
      skillLevel: 6,
      maxEnergyRecovery: 100
    });

    expect(result.dayHelps).toBe(102);
    expect(result.nightHelpsBeforeSS).toBe(2);
    expect(result.endingEnergy).toBe(0);
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: MOCKED_POKEMON,
  produce: {
    berries: [{ berry: berry.BELUE, amount: 2, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }]
  }
};
