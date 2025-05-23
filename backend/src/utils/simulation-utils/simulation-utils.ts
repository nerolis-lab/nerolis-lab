import type { ProductionStats } from '@src/domain/computed/production.js';
import type { ScheduledEvent } from '@src/domain/event/event.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import {
  PlayerInputEvent,
  PokemonInputEvent,
  TeamInputEvent
} from '@src/domain/event/events/input-event/input-event.js';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event.js';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event.js';
import { SleepEvent } from '@src/domain/event/events/sleep-event/sleep-event.js';
import { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateStartingEnergy } from '@src/services/calculator/energy/energy-calculator.js';
import type { Pokemon, Produce, SkillActivation, Summary, TimePeriod } from 'sleepapi-common';
import { CarrySizeUtils } from 'sleepapi-common';

export function startDayAndEnergy(
  dayInfo: SleepInfo,
  pokemon: Pokemon,
  input: ProductionStats,
  inventoryLimit: number,
  recoveryEvents: EnergyEvent[],
  skillActivations: SkillActivation[],
  eventLog: ScheduledEvent[],
  maxEnergyRecovery: number
) {
  const { startingEnergy, energyLeftInMorning, energyRecovered } = calculateStartingEnergy({
    dayPeriod: dayInfo,
    recoveryEvents,
    skillActivations,
    maxEnergyRecovery
  });
  const startingDayEvent: SleepEvent = new SleepEvent({
    time: dayInfo.period.start,
    description: 'Day start',
    period: { start: dayInfo.period.end, end: dayInfo.period.start },
    sleepState: 'end'
  });

  const inputPokemon: PokemonInputEvent = new PokemonInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input,
    pokemon
  });
  const inputTeam: TeamInputEvent = new TeamInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input
  });
  const inputPlayer: PlayerInputEvent = new PlayerInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input
  });

  const energyEvent: EnergyEvent = new EnergyEvent({
    time: dayInfo.period.start,
    description: 'Sleep',
    delta: energyRecovered,
    before: energyLeftInMorning
  });

  const inventoryEvent: InventoryEvent = new InventoryEvent({
    time: dayInfo.period.start,
    description: 'Start inventory',
    before: 0,
    delta: 0,
    max: inventoryLimit,
    contents: CarrySizeUtils.getEmptyInventory()
  });

  eventLog.push(startingDayEvent);
  eventLog.push(inputPokemon);
  eventLog.push(inputTeam);
  eventLog.push(inputPlayer);
  eventLog.push(energyEvent);
  eventLog.push(inventoryEvent);

  return startingEnergy;
}

export function startNight(params: {
  period: TimePeriod;
  currentInventory: Produce;
  inventoryLimit: number;
  eventLog: ScheduledEvent[];
}) {
  const { period, currentInventory, inventoryLimit, eventLog } = params;

  const emptyInventoryEvent: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Empty',
    delta: -CarrySizeUtils.countInventory(currentInventory),
    before: CarrySizeUtils.countInventory(currentInventory),
    max: inventoryLimit,
    contents: CarrySizeUtils.getEmptyInventory()
  });

  const sleepStartEvent: SleepEvent = new SleepEvent({
    time: period.end,
    description: 'Day end',
    period,
    sleepState: 'start'
  });

  eventLog.push(emptyInventoryEvent);
  eventLog.push(sleepStartEvent);
}

export function finishSimulation(params: {
  period: TimePeriod;
  currentInventory: Produce;
  totalSneakySnack: Produce;
  inventoryLimit: number;
  summary: Summary;
  eventLog: ScheduledEvent[];
}) {
  const { period, currentInventory, totalSneakySnack, inventoryLimit, summary, eventLog } = params;

  const endingDay: SleepEvent = new SleepEvent({
    time: period.end,
    description: 'Night ended',
    period,
    sleepState: 'end'
  });

  const addInventoryEvent: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Status',
    delta: 0,
    before: CarrySizeUtils.countInventory(currentInventory),
    max: inventoryLimit,
    contents: currentInventory
  });

  const sneakySnackClaim: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Sneaky snack claim',
    delta: -CarrySizeUtils.countInventory(totalSneakySnack),
    before: CarrySizeUtils.countInventory(totalSneakySnack),
    contents: CarrySizeUtils.getEmptyInventory()
  });

  const morningEmptyInventoryEvent: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Empty',
    delta: -CarrySizeUtils.countInventory(currentInventory),
    before: CarrySizeUtils.countInventory(currentInventory),
    max: inventoryLimit,
    contents: CarrySizeUtils.getEmptyInventory()
  });

  const skillStatusEvent: SkillEvent = new SkillEvent({
    time: period.end,
    description: 'Status',
    skillActivation: {
      adjustedAmount: 0,
      fractionOfProc: 0,
      nrOfHelpsToActivate: summary.nrOfHelps,
      skill: summary.skill
    }
  });

  const summaryEvent: SummaryEvent = new SummaryEvent({
    time: period.end,
    description: 'Summary',
    summary
  });

  eventLog.push(endingDay);
  eventLog.push(addInventoryEvent);
  eventLog.push(sneakySnackClaim);
  eventLog.push(morningEmptyInventoryEvent);
  eventLog.push(skillStatusEvent);
  eventLog.push(summaryEvent);
}
