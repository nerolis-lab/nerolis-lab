import type { ProductionStats } from '@src/domain/computed/production.js';
import type { ScheduledEvent } from '@src/domain/event/event.js';
import type { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { finishSimulation, startDayAndEnergy, startNight } from '@src/utils/simulation-utils/simulation-utils.js';
import { MOCKED_MAIN_SLEEP, MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_PRODUCE } from '@src/utils/test-utils/defaults.js';
import type { SkillActivation, Summary } from 'sleepapi-common';
import { CarrySizeUtils, ChargeStrengthS, nature, PINSIR } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('startDayAndEnergy', () => {
  it('shall calculate starting energy and log starting events', () => {
    const eventLog: ScheduledEvent[] = [];
    const dayInfo: SleepInfo = {
      period: MOCKED_MAIN_SLEEP,
      nature: nature.RASH,
      erb: 0,
      incense: false
    };
    const pkmn = PINSIR;
    const input: ProductionStats = MOCKED_OPTIMAL_PRODUCTION_STATS;
    const recoveryEvents: EnergyEvent[] = [];
    const skillActivations: SkillActivation[] = [];

    expect(
      startDayAndEnergy(
        dayInfo,
        pkmn,
        input,
        CarrySizeUtils.baseCarrySize(pkmn),
        recoveryEvents,
        skillActivations,
        eventLog,
        100
      )
    ).toBe(100);
    expect(eventLog).toHaveLength(6);
  });
});

describe('startNight', () => {
  it('shall push day ending events', () => {
    const eventLog: ScheduledEvent[] = [];

    startNight({ period: MOCKED_MAIN_SLEEP, currentInventory: MOCKED_PRODUCE, inventoryLimit: 2, eventLog });
    expect(eventLog).toHaveLength(2);
  });
});

describe('finishSimulation', () => {
  it('shall push simulation end events', () => {
    const eventLog: ScheduledEvent[] = [];
    const summary: Summary = {
      ingredientPercentage: 0.2,
      carrySize: 23,
      skillPercentage: 0.02,
      skill: ChargeStrengthS,
      skillProcs: 11,
      skillEnergySelfValue: 11,
      skillEnergyOthersValue: 11,
      skillProduceValue: MOCKED_PRODUCE,
      skillStrengthValue: 11,
      skillDreamShardValue: 11,
      skillPotSizeValue: 11,
      skillHelpsValue: 11,
      skillTastyChanceValue: 11,
      averageEnergy: 0,
      averageFrequency: 0,
      helpsAfterSS: 0,
      helpsBeforeSS: 0,
      nrOfHelps: 0,
      spilledIngredients: [],
      totalProduce: MOCKED_PRODUCE,
      totalRecovery: 0,
      collectFrequency: MOCKED_MAIN_SLEEP.end,
      skillBerriesOtherValue: 0
    };

    finishSimulation({
      period: MOCKED_MAIN_SLEEP,
      currentInventory: MOCKED_PRODUCE,
      totalSneakySnack: MOCKED_PRODUCE,
      inventoryLimit: 2,
      summary,
      eventLog
    });
    expect(eventLog).toHaveLength(6);
  });
});
