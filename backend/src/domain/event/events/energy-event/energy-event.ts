import type { EventType } from '@src/domain/event/event.js';
import { ScheduledEvent } from '@src/domain/event/event.js';
import { energyFactorFromEnergy } from '@src/services/calculator/energy/energy-calculator.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Time } from 'sleepapi-common';
import { MathUtils } from 'sleepapi-common';

export class EnergyEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'energy';
  description: string;

  delta: number;
  before?: number;
  after?: number;

  constructor(params: { time: Time; description: string; delta: number; before?: number }) {
    const { time, description, delta, before } = params;
    super();

    this.time = time;
    this.description = description;

    this.delta = MathUtils.round(delta, 2);
    this.before = before !== undefined ? MathUtils.round(before, 2) : undefined;
    this.after = before !== undefined ? MathUtils.round(before + delta, 2) : undefined;
  }

  format(): string {
    const deltaSigned = `${this.delta > 0 ? '+' : ''}${this.delta}%`;

    if (this.before !== undefined && this.after !== undefined) {
      return (
        `[${TimeUtils.prettifyTime(this.time)}][Energy] (${this.description}): Recovery: ${deltaSigned}, ` +
        `Energy: ${this.before}% -> ${this.after}%, Energy coefficient: ${energyFactorFromEnergy(this.after)}`
      );
    } else {
      return `[${TimeUtils.prettifyTime(this.time)}][Energy] (${this.description}): ${deltaSigned}`;
    }
  }
}
