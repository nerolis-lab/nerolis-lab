import type { PokemonProduce } from '@src/domain/combination/produce.js';
import { monteCarlo } from '@src/services/simulation-service/monte-carlo/monte-carlo.js';
import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults.js';
import { berry, CarrySizeUtils, ingredient, nature } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('monteCarlo', () => {
  it('shall run a basic monte carlo simulation', () => {
    const { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps } = monteCarlo({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      mealTimes: [],
      pokemonWithAverageProduce,
      inventoryLimit: CarrySizeUtils.baseCarrySize(MOCKED_POKEMON),
      recoveryEvents: [],
      skillPercentage: 1,
      skillLevel: 6,
      monteCarloIterations: 50,
      maxEnergyRecovery: 100
    });

    expect(dayHelps).toBe(102);
    expect(averageDailySkillProcs).toBe(102);
    expect(averageNightlySkillProcOdds).toBeGreaterThan(0);
    expect(averageNightlySkillProcOdds).toBeLessThan(1);
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: { ...MOCKED_POKEMON, specialty: 'berry', skillPercentage: 0.02 },
  produce: {
    berries: [{ berry: berry.BELUE, amount: 2, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }]
  }
};
