/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { PokemonProduce } from '@src/domain/combination/produce.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import type { ScheduledEvent } from '@src/domain/event/event.js';
import type { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator.js';
import { calculateAverageProduce } from '@src/services/calculator/production/produce-calculator.js';
import {
  calculateAverageNumberOfSkillProcsForHelps,
  calculateSkillProcs,
  scheduleSkillEvents
} from '@src/services/calculator/skill/skill-calculator.js';
import { monteCarlo } from '@src/services/simulation-service/monte-carlo/monte-carlo.js';
import { simulation } from '@src/services/simulation-service/simulator/simulator.js';
import {
  getDefaultRecoveryEvents,
  getExtraHelpfulEvents,
  getHelperBoostEvents
} from '@src/utils/event-utils/event-utils.js';
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils.js';
import type {
  BerrySet,
  DetailedProduce,
  PokemonWithIngredients,
  Produce,
  ProduceFlat,
  SkillActivation,
  Summary,
  Time
} from 'sleepapi-common';
import {
  BerryBurstDisguise,
  CarrySizeUtils,
  MAX_ENERGY_RECOVERY,
  MAX_ENERGY_RECOVERY_ERB,
  MEALS_IN_DAY,
  Metronome,
  berrySetToFlat,
  calculateAveragePokemonIngredientSet,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentageWithPityProc,
  countErbUsers,
  flatToBerrySet,
  flatToIngredientSet,
  limitSubSkillsToLevel,
  nature,
  subskill
} from 'sleepapi-common';

/**
 * Sets up all the simulation input and runs the simulated production window
 */
export function setupAndRunProductionSimulation(params: {
  pokemonSet: PokemonWithIngredients;
  input: ProductionStats;
  monteCarloIterations: number;
  preGeneratedSkillActivations?: SkillActivation[];
}): {
  detailedProduce: DetailedProduce;
  skillActivations: SkillActivation[];
  averageProduce: Produce;
  log: ScheduledEvent[];
  summary: Summary;
} {
  const { pokemonSet, input, monteCarloIterations, preGeneratedSkillActivations } = params;
  const {
    level,
    nature: maybeNature = nature.BASHFUL,
    subskills = new Set(),
    e4eProcs,
    e4eLevel,
    cheer,
    extraHelpful,
    helperBoostProcs,
    helperBoostUnique,
    helperBoostLevel,
    helpingBonus,
    camp,
    erb,
    incense,
    mainBedtime,
    mainWakeup,
    ribbon
  } = input;

  const averageIngredientList = calculateAveragePokemonIngredientSet(pokemonSet.ingredientList, level);
  const averageBerryList = berrySetToFlat([{ amount: 1, berry: pokemonSet.pokemon.berry, level }]);

  const ingredientPercentage = calculateIngredientPercentage({
    pokemon: pokemonSet.pokemon,
    nature: maybeNature,
    subskills
  });

  const skillPercentage = calculateSkillPercentageWithPityProc(pokemonSet.pokemon, subskills, maybeNature);

  const daySleepInfo: SleepInfo = {
    period: { end: mainBedtime, start: mainWakeup },
    nature: maybeNature,
    incense,
    erb: countErbUsers(erb, subskills)
  };

  const mealTimes = getDefaultMealTimes(daySleepInfo.period).sorted;

  const berriesPerDrop = calculateNrOfBerriesPerDrop(pokemonSet.pokemon.specialty, subskills);
  const sneakySnackBerries: BerrySet[] = [
    {
      amount: berriesPerDrop,
      berry: pokemonSet.pokemon.berry,
      level
    }
  ];

  const inventoryLimit = CarrySizeUtils.calculateCarrySize({
    baseWithEvolutions: input.inventoryLimit ?? CarrySizeUtils.maxCarrySize(pokemonSet.pokemon),
    subskillsLevelLimited: limitSubSkillsToLevel(subskills, level),
    ribbon,
    camp
  });

  const averageProduceFlat: ProduceFlat = calculateAverageProduce({
    ingredients: averageIngredientList,
    berries: averageBerryList,
    ingredientPercentage,
    berriesPerDrop
  });
  const pokemonWithAverageProduce: PokemonProduce = {
    pokemon: pokemonSet.pokemon,
    produce: {
      berries: flatToBerrySet(averageProduceFlat.berries, level),
      ingredients: flatToIngredientSet(averageProduceFlat.ingredients)
    }
  };

  const helpFrequency = calculateHelpSpeedBeforeEnergy({
    pokemon: pokemonSet.pokemon,
    level,
    nature: maybeNature,
    subskills,
    camp,
    ribbonLevel: input.ribbon,
    teamHelpingBonus: helpingBonus
  });

  const recoveryEvents = getDefaultRecoveryEvents(daySleepInfo.period, maybeNature, e4eProcs, e4eLevel, cheer);
  const extraHelpfulEvents = getExtraHelpfulEvents(daySleepInfo.period, extraHelpful, pokemonWithAverageProduce);
  const helperBoostEvents = getHelperBoostEvents(
    daySleepInfo.period,
    helperBoostProcs,
    helperBoostUnique,
    helperBoostLevel,
    pokemonWithAverageProduce
  );

  const maxEnergyRecovery = subskills.has(subskill.ENERGY_RECOVERY_BONUS.name)
    ? MAX_ENERGY_RECOVERY_ERB
    : MAX_ENERGY_RECOVERY;

  const skillActivations = preGeneratedSkillActivations
    ? preGeneratedSkillActivations
    : generateSkillActivations({
        dayInfo: daySleepInfo,
        helpFrequency,
        ingredientPercentage,
        skillPercentage,
        input,
        pokemonWithAverageProduce,
        inventoryLimit,
        sneakySnackBerries,
        recoveryEvents,
        mealTimes,
        monteCarloIterations,
        maxEnergyRecovery
      });

  const { detailedProduce, log, summary } = simulation({
    dayInfo: daySleepInfo,
    input,
    helpFrequency,
    ingredientPercentage,
    skillPercentage,
    pokemonWithAverageProduce,
    inventoryLimit,
    sneakySnackBerries,
    recoveryEvents,
    extraHelpfulEvents,
    helperBoostEvents,
    skillActivations,
    mealTimes,
    maxEnergyRecovery
  });

  return {
    detailedProduce: {
      ...detailedProduce,
      produce: {
        berries: detailedProduce.produce.berries,
        ingredients: detailedProduce.produce.ingredients.map(({ amount, ingredient }) => ({
          amount: amount / MEALS_IN_DAY,
          ingredient: ingredient
        }))
      }
    },
    averageProduce: {
      berries: pokemonWithAverageProduce.produce.berries,
      ingredients: pokemonWithAverageProduce.produce.ingredients
    },
    skillActivations,
    log,
    summary
  };
}

export function generateSkillActivations(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  input: ProductionStats;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  sneakySnackBerries: BerrySet[];
  monteCarloIterations: number;
  maxEnergyRecovery: number;
}) {
  const {
    dayInfo,
    helpFrequency,
    ingredientPercentage,
    skillPercentage,
    recoveryEvents,
    mealTimes,
    input,
    pokemonWithAverageProduce,
    inventoryLimit,
    sneakySnackBerries,
    monteCarloIterations,
    maxEnergyRecovery
  } = params;
  const skillLevel = input.skillLevel ?? pokemonWithAverageProduce.pokemon.skill.maxLevel;

  let oddsOfNightSkillProc = 0;
  let nrOfDaySkillProcs = 0;
  let nrOfDayHelps = 0;
  let nrOfSkillCrits = 0;

  // run Monte Carlo simulation to estimate skill activations
  const skill = pokemonWithAverageProduce.pokemon.skill;
  if (skill.hasUnit('energy') || skill.is(Metronome) || skill.is(BerryBurstDisguise)) {
    const { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps, skillCrits } = monteCarlo({
      dayInfo,
      helpFrequency,
      skillPercentage,
      skillLevel,
      pokemonWithAverageProduce,
      inventoryLimit,
      recoveryEvents,
      mealTimes,
      monteCarloIterations,
      maxEnergyRecovery
    });
    nrOfDaySkillProcs = averageDailySkillProcs;
    oddsOfNightSkillProc = averageNightlySkillProcOdds;
    nrOfDayHelps = dayHelps;
    nrOfSkillCrits = skillCrits;
  } else {
    const { detailedProduce } = simulation({
      dayInfo,
      input,
      helpFrequency,
      ingredientPercentage,
      skillPercentage,
      pokemonWithAverageProduce,
      inventoryLimit,
      sneakySnackBerries,
      recoveryEvents,
      extraHelpfulEvents: [],
      helperBoostEvents: [],
      skillActivations: [],
      mealTimes,
      maxEnergyRecovery
    });
    const { dayHelps, nightHelpsBeforeSS } = detailedProduce;
    nrOfDaySkillProcs = calculateSkillProcs(dayHelps ?? 0, skillPercentage);
    oddsOfNightSkillProc = calculateAverageNumberOfSkillProcsForHelps({
      skillPercentage,
      helps: nightHelpsBeforeSS,
      pokemonSpecialty: pokemonWithAverageProduce.pokemon.specialty
    });
    nrOfDayHelps = dayHelps;
  }

  return scheduleSkillEvents({
    skillLevel,
    pokemonWithAverageProduce,
    oddsOfNightSkillProc,
    nrOfDaySkillProcs,
    nrOfSkillCrits,
    nrOfDayHelps,
    uniqueHelperBoost: input.helperBoostUnique
  });
}
