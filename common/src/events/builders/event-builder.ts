import type { Event } from '../../types/events/event-types';
import type { Modifier } from '../../types/modifier/modifier';
import type { ModifierTargetType } from '../../types/modifier/target-types';

/**
 * Function that creates a modifier with access to input
 */
type ModifierFactory<TInput> = (input: TInput) => Modifier<ModifierTargetType>;

class EventBuilderImpl<TInput> {
  private event: Partial<Event> = {
    modifiers: []
  };
  public modifierFactories: ModifierFactory<TInput>[] = [];

  /**
   * Sets the name of the event
   */
  name(name: string): this {
    this.event.name = name;
    return this;
  }

  /**
   * Sets the description of the event
   */
  description(description: string): this {
    this.event.description = description;
    return this;
  }

  /**
   * Sets the start date of the event
   */
  startDate(date: Date): this {
    this.event.startDate = date;
    return this;
  }

  /**
   * Sets the end date of the event
   */
  endDate(date: Date): this {
    this.event.endDate = date;
    return this;
  }

  /**
   * Adds a modifier to the event
   * For static events (TInput = void), only accepts Modifier objects
   * For parameterized events, accepts both Modifier objects and ModifierFactory functions
   */
  addModifier(
    modifier: TInput extends void
      ? Modifier<ModifierTargetType>
      : Modifier<ModifierTargetType> | ModifierFactory<TInput>
  ): this {
    if (typeof modifier === 'function') {
      this.modifierFactories.push(modifier as ModifierFactory<TInput>);
    } else {
      if (!this.event.modifiers) {
        this.event.modifiers = [];
      }
      this.event.modifiers.push(modifier);
    }
    return this;
  }

  /**
   * Builds the event (static events - no input required)
   * If the builder has modifier factories, returns a function (input: TInput) => Event
   * If the builder has no modifier factories, returns Event directly
   */
  build(): TInput extends void ? Event : (input: TInput) => Event;

  /**
   * Builds the event with input for modifier factories (parameterized events)
   */
  build(input: TInput): Event;

  /**
   * Implementation of build method
   */
  build(input?: TInput): Event | ((input: TInput) => Event) {
    if (!this.event.name) {
      throw new Error('Event name is required');
    }

    if (!this.event.description) {
      throw new Error('Event description is required');
    }

    // If we have modifier factories but no input, return a function
    if (this.modifierFactories.length > 0 && input === undefined) {
      return (factoryInput: TInput) => {
        const dynamicModifiers = this.modifierFactories.map((factory) => factory(factoryInput));
        return {
          name: this.event.name!,
          description: this.event.description!,
          modifiers: [...(this.event.modifiers || []), ...dynamicModifiers],
          startDate: this.event.startDate,
          endDate: this.event.endDate
        };
      };
    }

    // Build dynamic modifiers from factories if we have them and input
    const dynamicModifiers =
      this.modifierFactories.length > 0 && input !== undefined
        ? this.modifierFactories.map((factory) => factory(input))
        : [];

    return {
      name: this.event.name,
      description: this.event.description,
      modifiers: [...(this.event.modifiers || []), ...dynamicModifiers],
      startDate: this.event.startDate,
      endDate: this.event.endDate
    };
  }
}

/**
 * Creates an EventBuilder for building static events (no input parameters)
 *
 * // Static event
 * EventBuilder()
 *   .name('test')
 *   .description('test')
 *   .build()
 */
export function EventBuilder(): EventBuilderImpl<void>;

/**
 * Creates an EventBuilder for building parameterized events with typed input
 *
 * @example
 * // Parameterized event
 * const myEventBuilder = EventBuilder<MyInput>()
 *   .name('test')
 *   .description('test')
 *   .addModifier(input => ({
 *     type: 'Pokemon',
 *     path: 'frequency',
 *     operation: '*',
 *     value: input.multiplier
 *   }));
 *
 * // Use: myEventBuilder.build({ multiplier: 0.9 })
 */
export function EventBuilder<TInput>(): EventBuilderImpl<TInput>;

/**
 * Implementation of EventBuilder factory
 * @example
 * // Static event
 * EventBuilder()
 *   .name('test')
 *   .description('test')
 *   .build()
 *
 * // Parameterized event
 * const myEventBuilder = EventBuilder<MyInput>()
 *   .name('test')
 *   .description('test')
 *   .addModifier(input => ({
 *     type: 'Pokemon',
 *     path: 'frequency',
 *     operation: '*',
 *     value: input.multiplier
 *   }));
 *
 * // Use: myEventBuilder.build({ multiplier: 0.9 })
 */
export function EventBuilder<TInput = void>(): EventBuilderImpl<TInput> {
  return new EventBuilderImpl<TInput>();
}
