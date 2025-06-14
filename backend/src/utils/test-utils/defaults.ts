import type { ProductionStats } from '@src/domain/computed/production.js';
import type { Pokemon, Produce, ProduceFlat, TimePeriod } from 'sleepapi-common';
import {
  berry,
  berrySetToFlat,
  ChargeStrengthM,
  commonMocks,
  ingredient,
  ingredientSetToFloatFlat,
  nature,
  subskill
} from 'sleepapi-common';

export const MOCKED_MAIN_SLEEP: TimePeriod = {
  start: {
    hour: 6,
    minute: 0,
    second: 0
  },
  end: {
    hour: 21,
    minute: 30,
    second: 0
  }
};

export const MOCKED_OPTIMAL_PRODUCTION_STATS: ProductionStats = {
  level: 60,
  ribbon: 0,
  nature: nature.QUIET,
  subskills: new Set([
    subskill.HELPING_SPEED_M.name,
    subskill.INGREDIENT_FINDER_M.name,
    subskill.INGREDIENT_FINDER_S.name
  ]),
  e4eProcs: 0,
  e4eLevel: 6,
  cheer: 0,
  extraHelpful: 0,
  helperBoostUnique: 1,
  helperBoostProcs: 0,
  helperBoostLevel: 6,
  helpingBonus: 0,
  camp: false,
  erb: 0,
  incense: false,
  skillLevel: 6,
  mainBedtime: MOCKED_MAIN_SLEEP.end,
  mainWakeup: MOCKED_MAIN_SLEEP.start
};

export const MOCKED_PRODUCE: Produce = {
  berries: [
    {
      amount: 2,
      berry: berry.GREPA,
      level: 60
    }
  ],
  ingredients: [
    {
      amount: 1,
      ingredient: ingredient.FANCY_APPLE
    }
  ]
};
export const MOCKED_PRODUCE_FLAT: ProduceFlat = {
  berries: berrySetToFlat([
    {
      amount: 2,
      berry: berry.GREPA,
      level: 60
    }
  ]),
  ingredients: ingredientSetToFloatFlat([
    {
      amount: 1,
      ingredient: ingredient.FANCY_APPLE
    }
  ])
};

export const MOCKED_POKEMON: Pokemon = commonMocks.mockPokemon({
  name: 'MOCK_POKEMON',
  frequency: 2500,
  ingredientPercentage: 20,
  skill: ChargeStrengthM,
  skillPercentage: 2,
  specialty: 'skill',
  carrySize: 20,
  ingredient0: [{ amount: 1, ingredient: ingredient.BEAN_SAUSAGE }],
  ingredient30: [{ amount: 2, ingredient: ingredient.FANCY_APPLE }],
  ingredient60: [{ amount: 3, ingredient: ingredient.FANCY_EGG }]
});
