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
import type { ScheduledEvent } from '@src/domain/event/event.js';
import type { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateSleepEnergyRecovery, maybeDegradeEnergy } from '@src/services/calculator/energy/energy-calculator.js';
import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator.js';
import type { MonteCarloResult } from '@src/services/simulation-service/monte-carlo/monte-carlo.js';
import { recoverEnergyEvents, recoverFromMeal } from '@src/utils/event-utils/event-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Produce, Time } from 'sleepapi-common';
import {
  BerryBurstDisguise,
  CarrySizeUtils,
  ChargeEnergySMoonlight,
  emptyProduce,
  EnergizingCheerS,
  MathUtils,
  RandomUtils
} from 'sleepapi-common';

/**
 * Runs the randomized simulation for Monte Carlo
 */
export function randomizedSimulation(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  skillPercentage: number;
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  energyFromYesterday: number;
  nightHelpsBeforeCarryFromYesterday: number;
  maxEnergyRecovery: number;
}): MonteCarloResult {
  // Set up input
  const {
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
  } = params;
  const nature = dayInfo.nature;
  const { pokemon, produce: averageProduce } = pokemonWithAverageProduce;

  const eventLog: ScheduledEvent[] = [];
  let currentInventory: Produce = emptyProduce();

  // summary values
  let skillProcsDay = 0;
  let skillProcsNight = 0;
  let skillCrits = 0;
  let dayHelps = 0;
  let nightHelpsBeforeSS = 0;

  // event array indices
  let energyIndex = 0;
  let mealIndex = 0;
  let disguiseBusted = false;

  // Set up start values
  let currentEnergy = Math.min(
    calculateSleepEnergyRecovery(
      { ...dayInfo, period: { start: dayInfo.period.end, end: dayInfo.period.start } },
      maxEnergyRecovery
    ) + energyFromYesterday,
    maxEnergyRecovery
  );

  let nextHelpEvent: Time = dayInfo.period.start;

  const energyEvents: EnergyEvent[] = TimeUtils.sortEventsForPeriod(dayInfo.period, recoveryEvents);

  let currentTime = dayInfo.period.start;
  let chunksOf5Minutes = 0;

  // check skill procs at night
  for (let i = 0; i < nightHelpsBeforeCarryFromYesterday; i++) {
    const skillActivated = RandomUtils.roll(skillPercentage);
    if (skillActivated) {
      if (pokemon.skill.hasUnit('energy')) {
        let energyAmount = pokemon.skill.activations.energy.amount(skillLevel) * nature.energy;
        if (pokemon.skill.is(EnergizingCheerS)) {
          // 20% chance it affects this Pokémon
          if (!RandomUtils.roll(0.2)) {
            energyAmount = 0;
          }
        } else if (pokemon.skill.is(ChargeEnergySMoonlight)) {
          if (RandomUtils.roll(ChargeEnergySMoonlight.activations.energy.critChance)) {
            skillCrits += 1;
            energyAmount += ChargeEnergySMoonlight.activations.energy.critAmount(skillLevel);
          }
        }
        currentEnergy = Math.min(currentEnergy + energyAmount, 150);
      } else if (!disguiseBusted && pokemon.skill.is(BerryBurstDisguise)) {
        if (RandomUtils.roll(BerryBurstDisguise.activations.berries.critChance)) {
          disguiseBusted = true;
          skillCrits += 1;
        }
      }
      skillProcsNight += 1;
      if (skillProcsNight === 2 || (pokemon.specialty !== 'skill' && pokemon.specialty !== 'all')) {
        break;
      }
    }
  }

  // --- DAY ---
  let period = dayInfo.period;
  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    const { recoveredAmount: mealRecovery, mealsProcessed } = recoverFromMeal({
      currentEnergy,
      currentTime,
      period,
      eventLog,
      mealTimes,
      mealIndex
    });
    const { recoveredEnergy: eventRecovery, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      energyIndex,
      currentTime,
      currentEnergy,
      period,
      eventLog
    });

    mealIndex = mealsProcessed;
    energyIndex = energyEventsProcessed;

    // check if help has occured
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      if (RandomUtils.roll(skillPercentage)) {
        skillProcsDay += 1;
        if (pokemon.skill.hasUnit('energy')) {
          let energyAmount = pokemon.skill.activations.energy.amount(skillLevel) * nature.energy;
          if (pokemon.skill.is(EnergizingCheerS)) {
            // 20% chance it affects this Pokémon
            if (!RandomUtils.roll(0.2)) {
              energyAmount = 0;
            }
          } else if (pokemon.skill.is(ChargeEnergySMoonlight)) {
            if (RandomUtils.roll(ChargeEnergySMoonlight.activations.energy.critChance)) {
              skillCrits += 1;
              energyAmount += ChargeEnergySMoonlight.activations.energy.critAmount(skillLevel);
            }
          }
          currentEnergy = Math.min(currentEnergy + energyAmount, 150);
        } else if (!disguiseBusted && pokemon.skill.is(BerryBurstDisguise)) {
          if (RandomUtils.roll(BerryBurstDisguise.activations.berries.critChance)) {
            disguiseBusted = true;
            skillCrits += 1;
          }
        }
      }

      ++dayHelps;
      nextHelpEvent = nextHelp;
    }

    currentEnergy += mealRecovery + eventRecovery;

    currentEnergy = MathUtils.round(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0 && chunksOf5Minutes >= 2,
          currentTime,
          currentEnergy,
          eventLog
        }),
      2
    );

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  period = { start: dayInfo.period.end, end: dayInfo.period.start };
  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    // only process helps if it fits in carry, not interested in total produce here
    if (
      CarrySizeUtils.countInventory(currentInventory) < inventoryLimit &&
      TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })
    ) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      currentInventory = CarrySizeUtils.addToInventory(currentInventory, averageProduce);

      ++nightHelpsBeforeSS;
      nextHelpEvent = nextHelp;
    }

    currentEnergy = MathUtils.round(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0,
          currentTime,
          currentEnergy,
          eventLog
        }),
      2
    );

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  return {
    dayHelps,
    nightHelpsBeforeSS,
    skillCrits,
    skillProcsDay,
    skillProcsNight,
    endingEnergy: currentEnergy
  };
}
