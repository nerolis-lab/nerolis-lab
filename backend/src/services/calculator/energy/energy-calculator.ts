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

import type { ScheduledEvent } from '@src/domain/event/event.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { SkillActivation, Time, TimePeriod } from 'sleepapi-common';
import { subskill } from 'sleepapi-common';

/**
 * Calculates a delta left at the end of the day and how that translates into tomorrow's starting energy
 */
export function calculateStartingEnergy(params: {
  dayPeriod: SleepInfo;
  recoveryEvents: EnergyEvent[];
  skillActivations: SkillActivation[];
  maxEnergyRecovery: number;
}) {
  const { dayPeriod, recoveryEvents, skillActivations, maxEnergyRecovery } = params;

  const sleepPeriod: TimePeriod = { start: dayPeriod.period.end, end: dayPeriod.period.start };
  const recoveryMainSleep = calculateSleepEnergyRecovery({ ...dayPeriod, period: sleepPeriod }, maxEnergyRecovery);

  const delta = calculateEnergyLeftInMorning(recoveryMainSleep, recoveryEvents, skillActivations);
  if (delta > 0) {
    const updatedDelta = calculateEnergyLeftInMorning(maxEnergyRecovery, recoveryEvents, skillActivations);

    const energyLeftToRecover = maxEnergyRecovery - updatedDelta;
    const energyRecovered = Math.min(energyLeftToRecover, recoveryMainSleep);
    const startingEnergy = updatedDelta + energyRecovered;

    return { startingEnergy, energyLeftInMorning: updatedDelta, energyRecovered };
  } else {
    const startingEnergy = Math.min(maxEnergyRecovery, recoveryMainSleep);

    return { startingEnergy, energyLeftInMorning: 0, energyRecovered: startingEnergy };
  }
}

export function calculateEnergyLeftInMorning(
  sleepRecovery: number,
  recoveryEvents: EnergyEvent[],
  skillActivations: SkillActivation[]
): number {
  const energyFromRecoveryEvents = recoveryEvents.reduce((sum, proc) => sum + proc.delta, 0);
  const energyFromSkillProcs = skillActivations.reduce(
    (sum, cur) => sum + (cur.skill.hasUnit('energy') ? cur.adjustedAmount : 0),
    0
  );

  const totalDayRecovery = energyFromRecoveryEvents + energyFromSkillProcs;

  const totalEnergyLoss = 24 * 6; // 24 hours, 6% lost per hour

  return Math.min(Math.max(sleepRecovery + totalDayRecovery - totalEnergyLoss, 0), 150);
}

/**
 * Uses numbers for representing Bedtime and Waking time
 * 21.5 = 21:30 (9:30PM)
 */
export function calculateSleepEnergyRecovery(nightPeriod: SleepInfo, maxEnergyRecovery: number): number {
  const { period, nature, erb, incense } = nightPeriod;

  const erbFactor = 1 + erb * subskill.ENERGY_RECOVERY_BONUS.amount;
  const incenseFactor = incense ? 2 : 1;

  const energyRecoveredPerMinute = 100 / (8.5 * 60);

  const sleepDuration = TimeUtils.calculateDuration(period);
  const sleepDurationInMinutes = sleepDuration.hour * 60 + sleepDuration.minute;

  const energyRecovered = sleepDurationInMinutes * energyRecoveredPerMinute * nature.energy * erbFactor * incenseFactor;

  return Math.min(energyRecovered, maxEnergyRecovery);
}

export function maybeDegradeEnergy(params: {
  timeToDegrade: boolean;
  currentTime: Time;
  currentEnergy: number;
  eventLog: ScheduledEvent[];
}) {
  const { timeToDegrade, currentTime, currentEnergy, eventLog } = params;
  let energyToDegrade = 0;

  if (timeToDegrade) {
    if (currentEnergy > 0) {
      energyToDegrade = Math.min(1, currentEnergy);
    }
    const energyLossEvent: EnergyEvent = new EnergyEvent({
      time: currentTime,
      description: 'Degrade',
      delta: -energyToDegrade,
      before: currentEnergy
    });

    eventLog.push(energyLossEvent);
  }

  return energyToDegrade;
}

export function energyFactorFromEnergy(energy: number) {
  if (energy >= 80) {
    return 0.45;
  } else if (energy >= 60) {
    return 0.52;
  } else if (energy >= 40) {
    return 0.58;
  } else if (energy >= 1) {
    return 0.66;
  } else {
    return 1;
  }
}
