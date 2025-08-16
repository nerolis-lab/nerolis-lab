import type {
  Event,
  ModifierCondition,
  ModifierOperation,
  ModifierTargetType,
  PokemonInstancePath,
  PokemonPath,
  SerializableModifier,
  TypedPath,
  UserPath
} from 'sleepapi-common';

/**
 * Fluent builder for creating events programmatically
 * This is used in the backend for predefined events
 */

export class EventBuilder {
  private event: Partial<Event> = {
    modifiers: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(name: string, description: string) {
    this.event.name = name;
    this.event.description = description;
  }

  /**
   * Add a modifier to the event (legacy string-based)
   */
  addModifier(
    targetType: ModifierTargetType,
    path: string,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    const modifier: SerializableModifier = {
      targetType,
      path,
      operation,
      value,
      ...options
    };

    this.event.modifiers!.push(modifier);
    return this;
  }

  /**
   * Add a type-safe modifier to the event
   */
  addTypedModifier<T extends ModifierTargetType>(
    targetType: T,
    path: TypedPath<T>,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    const modifier: SerializableModifier = {
      targetType,
      path: path as string,
      operation,
      value,
      ...options
    };

    this.event.modifiers!.push(modifier);
    return this;
  }

  /**
   * Convenience method for Pokemon modifiers (legacy string-based)
   */
  addPokemonModifier(
    path: string,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('Pokemon', path, operation, value, options);
  }

  /**
   * Type-safe method for Pokemon modifiers
   */
  addTypedPokemonModifier(
    path: PokemonPath,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('Pokemon', path as string, operation, value, options);
  }

  /**
   * Convenience method for PokemonInstance modifiers (legacy string-based)
   */
  addPokemonInstanceModifier(
    path: string,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('PokemonInstance', path, operation, value, options);
  }

  /**
   * Type-safe method for PokemonInstance modifiers
   */
  addTypedPokemonInstanceModifier(
    path: PokemonInstancePath,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('PokemonInstance', path as string, operation, value, options);
  }

  /**
   * Convenience method for User modifiers (legacy string-based)
   */
  addUserModifier(
    path: string,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('User', path, operation, value, options);
  }

  /**
   * Type-safe method for User modifiers
   */
  addTypedUserModifier(
    path: UserPath,
    operation: Exclude<ModifierOperation, 'function'>,
    value?: number,
    options?: {
      conditions?: ModifierCondition[];
      probability?: number;
    }
  ): this {
    return this.addModifier('User', path as string, operation, value, options);
  }

  /**
   * Add a condition helper
   */
  withCondition(
    targetType: ModifierTargetType,
    field: string,
    condition: ModifierCondition['type'],
    value?: unknown
  ): this {
    const lastModifier = this.event.modifiers![this.event.modifiers!.length - 1];
    if (lastModifier) {
      if (!lastModifier.conditions) {
        lastModifier.conditions = [];
      }
      lastModifier.conditions.push({
        type: condition,
        field,
        value
      });
    }
    return this;
  }

  /**
   * Set event schedule
   */
  withSchedule(startDate?: Date, endDate?: Date): this {
    if (startDate) this.event.startDate = startDate;
    if (endDate) this.event.endDate = endDate;
    return this;
  }

  /**
   * Set recurrence (placeholder for future implementation)
   */
  withRecurrence(recurrence: any): this {
    // Note: recurrence not implemented in current Event interface
    return this;
  }

  /**
   * Set metadata
   */
  withMetadata(metadata: {
    tags?: string[];
    icon?: string;
    color?: string;
    priority?: number;
    [key: string]: any;
  }): this {
    Object.assign(this.event, metadata);
    return this;
  }

  /**
   * Set enabled state (placeholder for future implementation)
   */
  enabled(_isEnabled: boolean = true): this {
    // Note: enabled not implemented in current Event interface
    return this;
  }

  /**
   * Mark as draft (placeholder for future implementation)
   */
  draft(_isDraft: boolean = true): this {
    // Note: draft not implemented in current Event interface
    return this;
  }

  /**
   * Build the final event
   */
  build(): Event {
    if (!this.event.name || !this.event.description) {
      throw new Error('Event must have name and description');
    }

    return this.event as Event;
  }
}

/**
 * Quick event creator for simple cases
 */
export function createEvent(name: string, description: string, modifiers: SerializableModifier[]): Event {
  return {
    name,
    description,
    modifiers,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
