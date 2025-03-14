import type { ProductionStats } from '@src/domain/computed/production.js';
import type { EventType } from '@src/domain/event/event.js';
import { ScheduledEvent } from '@src/domain/event/event.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Pokemon, Time } from 'sleepapi-common';

export abstract class InputEvent extends ScheduledEvent {
  type: EventType = 'info';
  abstract input: ProductionStats;
}

export class PokemonInputEvent extends InputEvent {
  time: Time;
  description: string;

  input: ProductionStats;
  pokemon: Pokemon;

  constructor(params: { time: Time; description: string; input: ProductionStats; pokemon: Pokemon }) {
    const { time, description, pokemon, input } = params;
    super();

    this.time = time;
    this.description = description;

    this.input = input;
    this.pokemon = pokemon;
  }

  format(): string {
    const { level, nature, subskills, skillLevel } = this.input;

    const input =
      `[${TimeUtils.prettifyTime(this.time)}][Input] (${this.pokemon.name}): ` +
      `Level: ${level}, Nature: ${nature?.prettyName ?? 'neutral'}, Main skill level: ${skillLevel}, ` +
      `Sub-skills: [${[...(subskills ?? [])].join(', ') ?? 'none'}]`;

    return input;
  }
}

export class TeamInputEvent extends InputEvent {
  time: Time;
  description: string;

  input: ProductionStats;

  constructor(params: { time: Time; description: string; input: ProductionStats }) {
    const { time, description, input } = params;
    super();

    this.time = time;
    this.description = description;

    this.input = input;
  }

  format(): string {
    const { e4eProcs, helpingBonus, erb } = this.input;
    const timeFormatted = TimeUtils.prettifyTime(this.time);

    const input =
      `[${timeFormatted}][Input] (Team): ` + `E4E: ${e4eProcs}, Helping bonus: ${helpingBonus}, ` + `ERB: ${erb}`;

    return input;
  }
}

export class PlayerInputEvent extends InputEvent {
  time: Time;
  description: string;

  input: ProductionStats;

  constructor(params: { time: Time; description: string; input: ProductionStats }) {
    const { time, description, input } = params;
    super();

    this.time = time;
    this.description = description;

    this.input = input;
  }

  format(): string {
    const { camp: goodCamp, incense: recoveryIncense } = this.input;
    const campStatus = goodCamp ? 'yes' : 'no';
    const incenseStatus = recoveryIncense ? 'yes' : 'no';
    const timeFormatted = TimeUtils.prettifyTime(this.time);

    const input = `[${timeFormatted}][Input] (Player): ` + `Camp: ${campStatus}, Recovery incense: ${incenseStatus}`;

    return input;
  }
}
