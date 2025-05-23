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
import type { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { randomizedSimulation } from '@src/services/simulation-service/monte-carlo/randomized-simulator.js';
import type { Time } from 'sleepapi-common';

export interface MonteCarloResult {
  skillProcsDay: number;
  skillProcsNight: number;
  skillCrits: number;
  dayHelps: number;
  nightHelpsBeforeSS: number;
  endingEnergy: number;
}

export function monteCarlo(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  skillPercentage: number;
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  monteCarloIterations: number;
  maxEnergyRecovery: number;
}) {
  const {
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
  } = params;

  const results: MonteCarloResult[] = [];
  let energyFromYesterday = 0;
  let nightHelpsBeforeCarryFromYesterday = 0;
  for (let i = 0; i < monteCarloIterations; i++) {
    const simResult = randomizedSimulation({
      dayInfo,
      helpFrequency,
      skillPercentage,
      skillLevel,
      pokemonWithAverageProduce,
      inventoryLimit,
      recoveryEvents,
      mealTimes,
      energyFromYesterday,
      nightHelpsBeforeCarryFromYesterday,
      maxEnergyRecovery
    });
    const { endingEnergy, nightHelpsBeforeSS } = simResult;

    energyFromYesterday = endingEnergy;
    nightHelpsBeforeCarryFromYesterday = nightHelpsBeforeSS;

    results.push(simResult);
  }

  const averageDailySkillProcs = results.reduce((sum, cur) => sum + cur.skillProcsDay, 0) / results.length;
  const averageNightlySkillProcOdds = results.reduce((sum, cur) => sum + cur.skillProcsNight, 0) / results.length;
  const dayHelps = results.reduce((sum, cur) => sum + cur.dayHelps, 0) / results.length;
  const skillCrits = results.reduce((sum, cur) => sum + cur.skillCrits, 0) / results.length;

  return { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps, skillCrits };
}
