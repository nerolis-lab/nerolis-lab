import type { ScheduledEvent } from '@src/domain/event/event.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import {
  calculateSleepEnergyRecovery,
  calculateStartingEnergy,
  maybeDegradeEnergy
} from '@src/services/calculator/energy/energy-calculator.js';
import { MOCKED_MAIN_SLEEP } from '@src/utils/test-utils/defaults.js';
import type { SkillActivation, Time } from 'sleepapi-common';
import { ChargeEnergyS, nature } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('calculateStartingEnergy', () => {
  it('shall calculate a realistic night correctly', () => {
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 21,
          minute: 30,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: false,
      nature: nature.LONELY,
      erb: 0
    };

    const { energyLeftInMorning, energyRecovered, startingEnergy } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: [],
      skillActivations: [],
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(88);
    expect(energyLeftInMorning).toBe(0);
    expect(energyRecovered).toBe(88);
  });

  it('shall start at full energy with energy down and 1 erb', () => {
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 21,
          minute: 30,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: false,
      nature: nature.LONELY,
      erb: 1
    };

    const { energyLeftInMorning, energyRecovered, startingEnergy } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: [],
      skillActivations: [],
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(100);
    expect(energyLeftInMorning).toBe(0);
    expect(energyRecovered).toBe(100);
  });

  it('a single e4e proc shall not be enough residual energy to affect starting energy', () => {
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 21,
          minute: 30,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: false,
      nature: nature.LONELY,
      erb: 0
    };
    const e4e: EnergyEvent[] = [
      new EnergyEvent({
        delta: 18,
        time: {
          hour: 6,
          minute: 0,
          second: 0
        },
        description: 'e4e'
      })
    ];

    const { energyLeftInMorning, energyRecovered, startingEnergy } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: e4e,
      skillActivations: [],
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(88);
    expect(energyRecovered).toBe(88);
    expect(energyLeftInMorning).toBe(0);
  });

  it('delta shall affect tomorrows starting energy', () => {
    // sleep recovers 94.11% for 8 hours
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 22,
          minute: 0,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: false,
      nature: nature.BASHFUL,
      erb: 0
    };
    const e4e: EnergyEvent[] = [
      new EnergyEvent({
        delta: 18,
        time: {
          hour: 6,
          minute: 0,
          second: 0
        },
        description: 'e4e'
      }),
      new EnergyEvent({
        delta: 18,
        time: {
          hour: 6,
          minute: 0,
          second: 0
        },
        description: 'e4e'
      }),
      new EnergyEvent({
        delta: 18,
        time: {
          hour: 6,
          minute: 0,
          second: 0
        },
        description: 'e4e'
      })
    ];

    const { energyLeftInMorning, energyRecovered, startingEnergy } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: e4e,
      skillActivations: [],
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(100);
    expect(energyLeftInMorning).toBe(10);
    expect(energyRecovered).toBe(90);
  });

  it('incense shall let us start with full energy for 6 hour sleep', () => {
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 0,
          minute: 0,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: true,
      nature: nature.BASHFUL,
      erb: 0
    };

    const { startingEnergy, energyLeftInMorning, energyRecovered } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: [],
      skillActivations: [],
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(100);
    expect(energyLeftInMorning).toBe(0);
    expect(energyRecovered).toBe(100);
  });

  it('self charge skill activation shall let us start at full despite low sleep score', () => {
    // 2 hour sleep
    const mainSleep: SleepInfo = {
      period: {
        end: {
          hour: 4,
          minute: 0,
          second: 0
        },
        start: {
          hour: 6,
          minute: 0,
          second: 0
        }
      },
      incense: false,
      nature: nature.BASHFUL,
      erb: 0
    };
    const skillActivations: SkillActivation[] = [];
    for (let i = 0; i < 15; i++) {
      skillActivations.push({
        adjustedAmount: ChargeEnergyS.activations.energy.amount(6),
        fractionOfProc: 1,
        nrOfHelpsToActivate: 0,
        skill: ChargeEnergyS
      });
    }

    const { startingEnergy, energyLeftInMorning, energyRecovered } = calculateStartingEnergy({
      dayPeriod: mainSleep,
      recoveryEvents: [],
      skillActivations,
      maxEnergyRecovery: 100
    });
    expect(startingEnergy).toBe(100);
    expect(energyLeftInMorning).toBe(150);
    expect(energyRecovered).toBe(-50);
  });
});

describe('calculateSleepRecovery', () => {
  it('shall calculate a full optimal night with no bonuses', () => {
    const bedtime: Time = {
      hour: 21,
      minute: 30,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: wakeupTime,
          end: bedtime
        },
        nature: nature.BASHFUL,
        incense: false,
        erb: 0
      },
      100
    );
    expect(energyRecovered).toBe(100);
  });

  it('shall calculate a short night with no bonuses', () => {
    const bedtime: Time = {
      hour: 23,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: bedtime,
          end: wakeupTime
        },
        nature: nature.BASHFUL,
        incense: false,
        erb: 0
      },
      100
    );
    expect(energyRecovered).toBe(82.3529411764706);
  });

  it('shall calculate a nap with no bonuses', () => {
    const bedtime: Time = {
      hour: 14,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 16,
      minute: 0,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: bedtime,
          end: wakeupTime
        },
        nature: nature.BASHFUL,
        incense: false,
        erb: 0
      },
      100
    );
    expect(energyRecovered).toBe(23.52941176470588);
  });

  it('negative energy nature and Energy Recovery Bonus shall cancel each other out', () => {
    const bedtime: Time = {
      hour: 21,
      minute: 30,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: wakeupTime,
          end: bedtime
        },
        nature: nature.LONELY,
        incense: false,
        erb: 1
      },
      100
    );
    expect(energyRecovered).toBe(100);
  });

  it('shall stack multiple ERB additively', () => {
    // sleep 4 hours 15 minutes (half duration), 2 ERB
    const bedtime: Time = {
      hour: 0,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 4,
      minute: 15,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: bedtime,
          end: wakeupTime
        },
        nature: nature.BASHFUL,
        incense: false,
        erb: 2
      },
      100
    );
    expect(energyRecovered).toBe(64);
  });

  it('shall clamp energy recovered to max', () => {
    const bedtime: Time = {
      hour: 20,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 8,
      minute: 0,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: wakeupTime,
          end: bedtime
        },
        nature: nature.BOLD,
        incense: true,
        erb: 2
      },
      87
    );
    expect(energyRecovered).toBe(87);
  });

  it('shall double recovery with incense', () => {
    const bedtime: Time = {
      hour: 0,
      minute: 0,
      second: 0
    };
    const wakeupTime: Time = {
      hour: 4,
      minute: 15,
      second: 0
    };
    const energyRecovered = calculateSleepEnergyRecovery(
      {
        period: {
          start: wakeupTime,
          end: bedtime
        },
        nature: nature.BASHFUL,
        incense: true,
        erb: 0
      },
      100
    );

    expect(energyRecovered).toBe(100);
  });
});

describe('maybeDegradeEnergy', () => {
  it('shall degrade energy and add event log', () => {
    const eventLog: ScheduledEvent[] = [];
    const time: Time = {
      hour: 6,
      minute: 0,
      second: 0
    };

    const energyToDegrade = maybeDegradeEnergy({
      timeToDegrade: true,
      currentTime: time,
      currentEnergy: 100,
      eventLog
    });
    expect(energyToDegrade).toBe(1);
    expect(eventLog).toMatchInlineSnapshot(`
[
  EnergyEvent {
    "after": 99,
    "before": 100,
    "delta": -1,
    "description": "Degrade",
    "time": {
      "hour": 6,
      "minute": 0,
      "second": 0,
    },
    "type": "energy",
  },
]
`);
  });

  it('shall not degrade below 0%', () => {
    const eventLog: ScheduledEvent[] = [];
    const energyToDegrade = maybeDegradeEnergy({
      timeToDegrade: true,
      currentTime: MOCKED_MAIN_SLEEP.start,
      currentEnergy: 0,
      eventLog
    });
    expect(energyToDegrade).toBe(0);
  });

  it('shall clamp final degrade if current energy between 0 and <1', () => {
    const eventLog: ScheduledEvent[] = [];
    const energyToDegrade = maybeDegradeEnergy({
      timeToDegrade: true,
      currentTime: MOCKED_MAIN_SLEEP.start,
      currentEnergy: 0.5,
      eventLog
    });
    expect(energyToDegrade).toBe(0.5);
    expect(eventLog).toMatchInlineSnapshot(`
[
  EnergyEvent {
    "after": 0,
    "before": 0.5,
    "delta": -0.5,
    "description": "Degrade",
    "time": {
      "hour": 6,
      "minute": 0,
      "second": 0,
    },
    "type": "energy",
  },
]
`);
  });
});
