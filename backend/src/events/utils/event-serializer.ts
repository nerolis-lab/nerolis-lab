import type { Event } from 'sleepapi-common';

/**
 * Utilities for serializing and deserializing events
 * Used for saving user-created events to database
 */

export class EventSerializer {
  /**
   * Prepare an event for database storage
   */
  static serialize(event: Event): string {
    return JSON.stringify(event);
  }

  /**
   * Restore an event from database
   */
  static deserialize(data: string): Event {
    const parsed = JSON.parse(data);

    // Convert date strings back to Date objects
    if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
    if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);

    return parsed as Event;
  }

  /**
   * Validate a serialized event
   */
  static validate(event: Event): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.name) errors.push('Event must have a name');
    if (!event.description) errors.push('Event must have a description');
    if (!Array.isArray(event.modifiers)) errors.push('Event must have modifiers array');

    // Validate each modifier
    event.modifiers?.forEach((modifier, index) => {
      if (!modifier.targetType) {
        errors.push(`Modifier ${index} must have a targetType`);
      }
      if (!modifier.path) {
        errors.push(`Modifier ${index} must have a path`);
      }
      if (!modifier.operation) {
        errors.push(`Modifier ${index} must have an operation`);
      }
      if (modifier.operation !== '=' && modifier.value === undefined) {
        errors.push(`Modifier ${index} must have a value for operation ${modifier.operation}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize user input for an event
   */
  static sanitize(event: Partial<Event>): Event {
    const sanitized: Event = {
      name: (event.name || 'Untitled Event').substring(0, 100),
      description: (event.description || '').substring(0, 500),
      modifiers: event.modifiers || [],
      createdAt: event.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Sanitize modifiers
    sanitized.modifiers = sanitized.modifiers.map((mod) => ({
      targetType: mod.targetType,
      path: mod.path.substring(0, 100),
      operation: mod.operation,
      value: typeof mod.value === 'number' ? mod.value : undefined,
      conditions: mod.conditions?.slice(0, 5), // Limit conditions
      probability: mod.probability !== undefined ? Math.max(0, Math.min(1, mod.probability)) : undefined
    }));

    return sanitized;
  }
}
