import type {
  Event,
  EventContext,
  EventResult,
  ModifierCondition,
  ModifierResult,
  ModifierTargetType,
  ModifierTargetTypeExt,
  SerializableModifier
} from 'sleepapi-common';

/**
 * Core engine for applying events and modifiers
 * This runs on the backend during simulations
 */

export interface ModifierEngineConfig {
  debug?: boolean;
  strict?: boolean; // Throw errors instead of logging
  maxDepth?: number; // Max depth for nested paths
  timeout?: number; // Max time for applying an event (ms)
}

export class ModifierEngine {
  private config: ModifierEngineConfig;

  constructor(config: ModifierEngineConfig = {}) {
    this.config = {
      debug: false,
      strict: false,
      maxDepth: 10,
      timeout: 1000,
      ...config
    };
  }

  /**
   * Apply an event to a context
   */
  async applyEvent(context: EventContext, event: Event): Promise<EventResult> {
    const startTime = new Date();
    const result: EventResult = {
      success: true,
      eventId: event.name,
      eventName: event.name,
      context: this.cloneContext(context),
      modifierResults: [],
      errors: [],
      warnings: [],
      totalModifiers: event.modifiers.length,
      appliedModifiers: 0,
      skippedModifiers: 0,
      failedModifiers: 0,
      startTime,
      endTime: new Date(),
      duration: 0
    };

    // Check if event is active
    const now = new Date();
    if (!this.isEventActive(event, now)) {
      result.warnings.push(`Event ${event.name} is not active`);
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - startTime.getTime();
      return result;
    }

    // Apply each modifier
    for (const modifier of event.modifiers) {
      // Check timeout
      if (this.config.timeout) {
        const elapsed = Date.now() - startTime.getTime();
        if (elapsed > this.config.timeout) {
          result.errors.push(`Event application timeout after ${elapsed}ms`);
          result.success = false;
          break;
        }
      }

      try {
        const modifierResult = await this.applyModifier(result.context, modifier);

        result.modifierResults.push(modifierResult);

        if (modifierResult.applied) {
          result.appliedModifiers++;
        } else {
          result.skippedModifiers++;
        }
      } catch (error) {
        result.failedModifiers++;
        result.errors.push(`Failed to apply modifier ${modifier.targetType}.${modifier.path}: ${error}`);

        if (this.config.strict) {
          throw error;
        }
      }
    }

    result.endTime = new Date();
    result.duration = result.endTime.getTime() - startTime.getTime();
    result.success = result.errors.length === 0;

    this.log('Event result:', result);
    return result;
  }

  /**
   * Apply multiple events in sequence
   */
  async applyEvents(context: EventContext, events: Event[]): Promise<EventResult[]> {
    const results: EventResult[] = [];
    let currentContext = this.cloneContext(context);

    for (const event of events) {
      const result = await this.applyEvent(currentContext, event);
      results.push(result);

      if (result.success) {
        currentContext = result.context;
      } else if (this.config.strict) {
        break; // Stop on first failure in strict mode
      }
    }

    return results;
  }

  /**
   * Apply a single modifier to the context
   */
  private async applyModifier(context: EventContext, modifier: SerializableModifier): Promise<ModifierResult> {
    const result: ModifierResult = {
      applied: false,
      path: `${modifier.targetType}.${modifier.path}`
    };

    // Get the target object
    const target = this.getTarget(context, modifier.targetType);
    if (!target) {
      result.reason = `Target ${modifier.targetType} not found in context`;
      return result;
    }

    // Check conditions
    if (modifier.conditions && modifier.conditions.length > 0) {
      const conditionsMet = this.checkConditions(target, modifier.conditions);
      if (!conditionsMet) {
        result.reason = 'Conditions not met';
        return result;
      }
    }

    // Check probability
    if (modifier.probability !== undefined) {
      const random = context.random?.() ?? Math.random();
      if (random > modifier.probability) {
        result.reason = `Probability check failed (${random.toFixed(2)} > ${modifier.probability})`;
        return result;
      }
    }

    // Apply the modification
    try {
      const { oldValue, newValue } = this.modifyValue(target, modifier.path, modifier.operation, modifier.value);

      result.applied = true;
      result.oldValue = oldValue;
      result.newValue = newValue;

      this.log(`Applied ${modifier.targetType}.${modifier.path}: ${oldValue} → ${newValue}`);
    } catch (error) {
      result.reason = `Failed to modify: ${error}`;
    }

    return result;
  }

  /**
   * Modify a value at a path in an object
   */
  private modifyValue(
    obj: ModifierTargetTypeExt,
    path: string,
    operation: string,
    value?: number
  ): { oldValue: number; newValue: number } {
    const paths = path.split('.');
    const result = { oldValue: undefined, newValue: undefined };

    // Navigate to the property
    let current = obj;
    for (let i = 0; i < paths.length - 1; i++) {
      const segment = paths[i];

      if (segment === '*') {
        // Apply to all array elements
        if (Array.isArray(current)) {
          const remainingPath = paths.slice(i + 1).join('.');
          current.forEach((item) => {
            this.modifyValue(item, remainingPath, operation, value);
          });
          return result; // Early return for wildcard
        }
      } else if (segment.match(/^\d+$/)) {
        // Array index
        const index = parseInt(segment);
        if (Array.isArray(current) && index < current.length) {
          current = current[index];
        } else {
          throw new Error(`Invalid array index: ${segment}`);
        }
      } else {
        // Object property
        if (current[segment] === undefined) {
          // Create the path if it doesn't exist
          current[segment] = {};
        }
        current = current[segment];
      }
    }

    // Apply the operation
    const lastPath = paths[paths.length - 1];

    if (lastPath === '*' && Array.isArray(current)) {
      // Apply to all elements at the end
      current.forEach((item, index) => {
        const old = current[index];
        current[index] = this.applyOperation(old, operation, value);
        result.oldValue = old;
        result.newValue = current[index];
      });
    } else {
      result.oldValue = current[lastPath];
      result.newValue = this.applyOperation(current[lastPath], operation, value);
      current[lastPath] = result.newValue;
    }

    return result;
  }

  /**
   * Apply an operation to a value
   */
  private applyOperation(current: any, operation: string, value?: number): any {
    const val = value ?? 0;
    const curr = current ?? 0;

    switch (operation) {
      case '*':
        return curr * val;
      case '+':
        return curr + val;
      case '-':
        return curr - val;
      case '/':
        return val !== 0 ? curr / val : curr;
      case '=':
        return val;
      default:
        return current;
    }
  }

  /**
   * Check if conditions are met
   */
  private checkConditions(target: any, conditions: ModifierCondition[]): boolean {
    return conditions.every((condition) => {
      const fieldValue = this.getFieldValue(target, condition.field);
      switch (condition.type) {
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        case 'greater':
          return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue > condition.value;
        case 'less':
          return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue < condition.value;
        case 'greaterOrEqual':
          return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue >= condition.value;
        case 'lessOrEqual':
          return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue <= condition.value;
        case 'includes':
          return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
        case 'in':
          return condition.values?.includes(fieldValue) ?? false;
        case 'notIn':
          return !(condition.values?.includes(fieldValue) ?? false);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        case 'notExists':
          return fieldValue === undefined || fieldValue === null;
        default:
          return true;
      }
    });
  }

  /**
   * Get a field value from an object using dot notation
   */
  private getFieldValue(obj: any, field: string): any {
    const paths = field.split('.');
    let current = obj;

    for (const path of paths) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[path];
    }

    return current;
  }

  /**
   * Get target from context
   */
  private getTarget(context: EventContext, targetType: ModifierTargetType): any {
    switch (targetType) {
      case 'Pokemon':
        return context.pokemon;
      case 'PokemonInstance':
        return context.pokemonInstance;
      case 'User':
        return context.user;
      case 'Team':
        return context.team;
      case 'Inventory':
        return context.inventory;
      default:
        return context[targetType];
    }
  }

  /**
   * Check if an event is currently active
   */
  private isEventActive(event: Event, now: Date): boolean {
    if (event.startDate && now < event.startDate) return false;
    if (event.endDate && now > event.endDate) return false;
    return true;
  }

  /**
   * Clone the context deeply
   */
  private cloneContext(context: EventContext): EventContext {
    // Use structuredClone if available (Node 17+)
    if (typeof structuredClone === 'function') {
      // Preserve functions like random
      const cloned = structuredClone(context);
      if (context.random) cloned.random = context.random;
      return cloned;
    }

    // Fallback to JSON parse/stringify (loses functions)
    return JSON.parse(JSON.stringify(context));
  }

  /**
   * Log debug messages
   */
  private log(..._args: unknown[]): void {
    // TODO: Implement proper logging
  }
}

// Singleton instance for convenience
export const modifierEngine = new ModifierEngine();
