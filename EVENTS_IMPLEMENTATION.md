Pokemon Event Modifier System - Monorepo Implementation Guide
Architecture Overview

common: Shared types and interfaces (backend & frontend)
backend: Event engine, simulation, predefined events
frontend: UI for creating/configuring events

Project Structure
common/
├── src/
│ └── types/
│ ├── pokemon.types.ts (existing)
│ ├── events/
│ │ ├── modifier.types.ts
│ │ ├── event.types.ts
│ │ └── index.ts
│ └── index.ts

backend/
├── src/
│ └── events/
│ ├── engine/
│ │ └── modifier-engine.ts
│ ├── builders/
│ │ ├── event-builder.ts
│ │ └── modifier-builders.ts
│ ├── events/
│ │ └── predefined-events.ts
│ ├── utils/
│ │ └── event-serializer.ts
│ └── index.ts

frontend/
├── src/
│ └── features/
│ └── events/
│ ├── components/
│ │ ├── EventCreator.tsx
│ │ └── ModifierBuilder.tsx
│ ├── hooks/
│ │ └── useEventBuilder.ts
│ └── utils/
│ └── event-validator.ts
Part 1: Common Types
File: common/src/types/events/modifier.types.ts
typescript/\*\*

- Core modifier types shared between frontend and backend
- These types define the structure of modifiers and events
  \*/

// Supported operations for modifying values
export type ModifierOperation = '\*' | '+' | '-' | '/' | '=' | 'function';

// Target types that can be modified
export type ModifierTargetType = 'Pokemon' | 'PokemonInstance' | 'User' | 'Team' | 'Inventory';

// Base modifier interface - used for runtime
export interface IModifier<T = any> {
targetType: ModifierTargetType;
path: string;
operation: ModifierOperation;
value?: number;
// Note: condition and function are only used in backend
// Frontend will use SerializableModifier
}

// Serializable modifier for network transfer and storage
export interface SerializableModifier {
targetType: ModifierTargetType;
path: string;
operation: Exclude<ModifierOperation, 'function'>; // Can't serialize functions
value?: number;
conditions?: ModifierCondition[];
probability?: number;
}

// Condition types that can be serialized
export interface ModifierCondition {
type: 'equals' | 'notEquals' | 'greater' | 'less' | 'greaterOrEqual' | 'lessOrEqual' | 'includes' | 'in' | 'notIn' | 'exists' | 'notExists';
field: string;
value?: any;
values?: any[]; // For 'in' and 'notIn' operations
}

// Result of applying a modifier
export interface ModifierResult {
applied: boolean;
path: string;
oldValue?: any;
newValue?: any;
reason?: string; // Why it wasn't applied (condition failed, probability, etc.)
}

// Validation result for modifiers
export interface ModifierValidation {
valid: boolean;
errors: string[];
warnings: string[];
}
File: common/src/types/events/event.types.ts
typescriptimport { SerializableModifier, ModifierTargetType } from './modifier.types';
import { Pokemon, PokemonInstance } from '../pokemon.types';
import { User } from '../user.types';

/\*\*

- Event type definitions shared between frontend and backend
  \*/

// Core event structure
export interface Event {
id: string;
name: string;
description: string;
modifiers: SerializableModifier[];

// Metadata
createdBy?: string; // User ID who created it
createdAt?: Date;
updatedAt?: Date;

// Scheduling
startDate?: Date;
endDate?: Date;
recurrence?: EventRecurrence;

// Status
enabled?: boolean;
draft?: boolean; // True if still being edited
approved?: boolean; // For user-created events

// Categorization
tags?: string[];
category?: EventCategory;
rarity?: EventRarity;

// Display
icon?: string;
color?: string;
priority?: number; // Display order
}

export type EventCategory =
| 'daily'
| 'weekly'
| 'seasonal'
| 'special'
| 'user-created'
| 'system';

export type EventRarity =
| 'common'
| 'uncommon'
| 'rare'
| 'epic'
| 'legendary';

export interface EventRecurrence {
type: 'daily' | 'weekly' | 'monthly' | 'custom';
interval?: number; // Every N days/weeks/months
daysOfWeek?: number[]; // 0-6, Sunday-Saturday
dayOfMonth?: number; // 1-31
endAfter?: number; // Number of occurrences
endDate?: Date;
}

// Event context holds all objects that might be modified
export interface EventContext {
pokemon?: Pokemon;
pokemonInstance?: PokemonInstance;
user?: User;
team?: any; // Define your Team type
inventory?: any; // Define your Inventory type

// Runtime context
timestamp?: Date;
random?: () => number; // For deterministic random in simulations

// Allow extension for custom data
[key: string]: any;
}

// Result of applying an event
export interface EventResult {
success: boolean;
eventId: string;
eventName: string;
context: EventContext;
modifierResults: ModifierResult[];
errors: string[];
warnings: string[];

// Statistics
totalModifiers: number;
appliedModifiers: number;
skippedModifiers: number;
failedModifiers: number;

// Timing
startTime: Date;
endTime: Date;
duration: number; // milliseconds
}

// Event template for UI
export interface EventTemplate {
id: string;
name: string;
description: string;
category: EventCategory;
modifiers: SerializableModifier[];
variables?: EventVariable[]; // User can customize these
preview?: string; // Preview image/icon
}

export interface EventVariable {
key: string;
label: string;
type: 'number' | 'string' | 'boolean' | 'select';
defaultValue: any;
options?: { label: string; value: any }[]; // For select type
min?: number; // For number type
max?: number; // For number type
step?: number; // For number type
}
File: common/src/types/events/index.ts
typescript/\*\*

- Export all event-related types
  \*/

export _ from './modifier.types';
export _ from './event.types';

// Re-export commonly used types for convenience
export type {
ModifierOperation,
ModifierTargetType,
SerializableModifier,
ModifierCondition,
Event,
EventContext,
EventResult,
EventCategory,
EventRarity
} from './modifier.types';
Update: common/src/types/index.ts
typescript// Your existing exports
export _ from './pokemon.types';
export _ from './user.types';
// ... other existing exports

// Add event types
export \* from './events';
Part 2: Backend Implementation
File: backend/src/events/engine/modifier-engine.ts
typescriptimport {
Event,
EventContext,
EventResult,
SerializableModifier,
ModifierResult,
ModifierCondition,
ModifierTargetType
} from '@your-org/common/types/events';

/\*\*

- Core engine for applying events and modifiers
- This runs on the backend during simulations
  \*/

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

/\*\*

- Apply an event to a context
  \*/
  async applyEvent(
  context: EventContext,
  event: Event
  ): Promise<EventResult> {
  const startTime = new Date();
  const result: EventResult = {
  success: true,
  eventId: event.id,
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
      result.warnings.push(`Event ${event.id} is not active`);
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
        const modifierResult = await this.applyModifier(
          result.context,
          modifier
        );

        result.modifierResults.push(modifierResult);

        if (modifierResult.applied) {
          result.appliedModifiers++;
        } else {
          result.skippedModifiers++;
        }
      } catch (error) {
        result.failedModifiers++;
        result.errors.push(
          `Failed to apply modifier ${modifier.targetType}.${modifier.path}: ${error}`
        );

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

/\*\*

- Apply multiple events in sequence
  \*/
  async applyEvents(
  context: EventContext,
  events: Event[]
  ): Promise<EventResult[]> {
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

/\*\*

- Apply a single modifier to the context
  \*/
  private async applyModifier(
  context: EventContext,
  modifier: SerializableModifier
  ): Promise<ModifierResult> {
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
      const { oldValue, newValue } = this.modifyValue(
        target,
        modifier.path,
        modifier.operation,
        modifier.value
      );

      result.applied = true;
      result.oldValue = oldValue;
      result.newValue = newValue;

      this.log(`Applied ${modifier.targetType}.${modifier.path}: ${oldValue} → ${newValue}`);
    } catch (error) {
      result.reason = `Failed to modify: ${error}`;
    }

    return result;

}

/\*\*

- Modify a value at a path in an object
  \*/
  private modifyValue(
  obj: any,
  path: string,
  operation: string,
  value?: number
  ): { oldValue: any; newValue: any } {
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

/\*\*

- Apply an operation to a value
  \*/
  private applyOperation(
  current: any,
  operation: string,
  value?: number
  ): any {
  const val = value ?? 0;
  const curr = current ?? 0;


    switch (operation) {
      case '*': return curr * val;
      case '+': return curr + val;
      case '-': return curr - val;
      case '/': return val !== 0 ? curr / val : curr;
      case '=': return val;
      default: return current;
    }

}

/\*\*

- Check if conditions are met
  \*/
  private checkConditions(
  target: any,
  conditions: ModifierCondition[]
  ): boolean {
  return conditions.every(condition => {
  const fieldValue = this.getFieldValue(target, condition.field);
      switch (condition.type) {
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        case 'greater':
          return fieldValue > condition.value;
        case 'less':
          return fieldValue < condition.value;
        case 'greaterOrEqual':
          return fieldValue >= condition.value;
        case 'lessOrEqual':
          return fieldValue <= condition.value;
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

/\*\*

- Get a field value from an object using dot notation
  \*/
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

/\*\*

- Get target from context
  \*/
  private getTarget(
  context: EventContext,
  targetType: ModifierTargetType
  ): any {
  switch (targetType) {
  case 'Pokemon': return context.pokemon;
  case 'PokemonInstance': return context.pokemonInstance;
  case 'User': return context.user;
  case 'Team': return context.team;
  case 'Inventory': return context.inventory;
  default: return context[targetType];
  }
  }

/\*\*

- Check if an event is currently active
  \*/
  private isEventActive(event: Event, now: Date): boolean {
  if (event.enabled === false) return false;
  if (event.draft === true) return false;
  if (event.startDate && now < event.startDate) return false;
  if (event.endDate && now > event.endDate) return false;
  return true;
  }

/\*\*

- Clone the context deeply
  \*/
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

/\*\*

- Log debug messages
  \*/
  private log(...args: any[]): void {
  if (this.config.debug) {
  console.log('[ModifierEngine]', ...args);
  }
  }
  }

// Singleton instance for convenience
export const modifierEngine = new ModifierEngine();
File: backend/src/events/builders/event-builder.ts
typescriptimport {
Event,
SerializableModifier,
ModifierCondition,
ModifierOperation,
ModifierTargetType,
EventCategory,
EventRarity,
EventRecurrence
} from '@your-org/common/types/events';

/\*\*

- Fluent builder for creating events programmatically
- This is used in the backend for predefined events
  \*/

export class EventBuilder {
private event: Partial<Event> = {
modifiers: [],
enabled: true,
draft: false,
createdAt: new Date(),
updatedAt: new Date()
};

constructor(id: string, name: string, description: string) {
this.event.id = id;
this.event.name = name;
this.event.description = description;
}

/\*\*

- Add a modifier to the event
  \*/
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

/\*\*

- Convenience method for Pokemon modifiers
  \*/
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

/\*\*

- Convenience method for PokemonInstance modifiers
  \*/
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

/\*\*

- Convenience method for User modifiers
  \*/
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

/\*\*

- Add a condition helper
  \*/
  withCondition(
  targetType: ModifierTargetType,
  field: string,
  condition: ModifierCondition['type'],
  value?: any
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

/\*\*

- Set event schedule
  \*/
  withSchedule(startDate?: Date, endDate?: Date): this {
  if (startDate) this.event.startDate = startDate;
  if (endDate) this.event.endDate = endDate;
  return this;
  }

/\*\*

- Set recurrence
  \*/
  withRecurrence(recurrence: EventRecurrence): this {
  this.event.recurrence = recurrence;
  return this;
  }

/\*\*

- Set metadata
  \*/
  withMetadata(metadata: {
  category?: EventCategory;
  rarity?: EventRarity;
  tags?: string[];
  icon?: string;
  color?: string;
  priority?: number;
  }): this {
  Object.assign(this.event, metadata);
  return this;
  }

/\*\*

- Set enabled state
  \*/
  enabled(isEnabled: boolean = true): this {
  this.event.enabled = isEnabled;
  return this;
  }

/\*\*

- Mark as draft
  \*/
  draft(isDraft: boolean = true): this {
  this.event.draft = isDraft;
  return this;
  }

/\*\*

- Build the final event
  \*/
  build(): Event {
  if (!this.event.id || !this.event.name || !this.event.description) {
  throw new Error('Event must have id, name, and description');
  }


    return this.event as Event;

}
}

/\*\*

- Quick event creator for simple cases
  \*/
  export function createEvent(
  id: string,
  name: string,
  description: string,
  modifiers: SerializableModifier[]
  ): Event {
  return {
  id,
  name,
  description,
  modifiers,
  enabled: true,
  draft: false,
  createdAt: new Date(),
  updatedAt: new Date()
  };
  }
  File: backend/src/events/events/predefined-events.ts
  typescriptimport { Event } from '@your-org/common/types/events';
  import { EventBuilder } from '../builders/event-builder';

/\*\*

- Predefined events for the game
- These are created by developers, not users
  \*/

// The ingredient boost event you requested
export const ingredientSpecialistEvent: Event = new EventBuilder(
'ingredient-boost-2024',
'Ingredient Specialist Boost',
'All Pokemon get +1 ingredient, specialists sometimes get +2'
)
// Everyone gets +1 to all ingredient amounts
.addPokemonModifier('ingredient0._.amount', '+', 1)
.addPokemonModifier('ingredient30._.amount', '+', 1)
.addPokemonModifier('ingredient60.\*.amount', '+', 1)

// Ingredient specialists have 50% chance for another +1
.addPokemonModifier('ingredient30._.amount', '+', 1, {
conditions: [{
type: 'equals',
field: 'specialty',
value: 'ingredient'
}],
probability: 0.5
})
.addPokemonModifier('ingredient60._.amount', '+', 1, {
conditions: [{
type: 'equals',
field: 'specialty',
value: 'ingredient'
}],
probability: 0.5
})
.withMetadata({
category: 'special',
rarity: 'rare',
tags: ['ingredient', 'boost', 'specialist'],
icon: 'ingredient-boost',
color: '#4CAF50',
priority: 100
})
.build();

// Berry specialist frequency boost
export const berryFrenzyEvent: Event = new EventBuilder(
'berry-frenzy-december',
'Berry Frenzy',
'All Pokemon get 20% frequency boost, berry specialists get 32% total'
)
.addPokemonModifier('frequency', '_', 1.2)
.addPokemonModifier('frequency', '_', 1.1, {
conditions: [{
type: 'equals',
field: 'specialty',
value: 'berry'
}]
})
.withSchedule(
new Date('2024-12-01'),
new Date('2024-12-31')
)
.withMetadata({
category: 'seasonal',
rarity: 'uncommon',
tags: ['berry', 'frequency', 'december', 'seasonal'],
icon: 'berry-frenzy',
color: '#E91E63'
})
.build();

// Daily login bonus
export const dailyLoginBonus: Event = new EventBuilder(
'daily-login-bonus',
'Daily Login Bonus',
'Get rewards for logging in each day'
)
.addUserModifier('eventTokens', '+', 10)
.addUserModifier('experience', '+', 100)
.withRecurrence({
type: 'daily',
interval: 1
})
.withMetadata({
category: 'daily',
rarity: 'common',
tags: ['daily', 'login', 'reward'],
icon: 'daily-bonus',
color: '#2196F3'
})
.build();

// Complex evolution event
export const evolutionAdvantageEvent: Event = new EventBuilder(
'evolution-advantage',
'Evolution Advantage',
'Evolved Pokemon get progressive bonuses'
)
// Base skill boost for all
.addPokemonModifier('skillPercentage', '+', 5)

// Additional boost for evolved Pokemon (1+ evolutions)
.addPokemonModifier('skillPercentage', '+', 10, {
conditions: [{
type: 'greater',
field: 'previousEvolutions',
value: 0
}]
})

// Final evolution bonus
.addPokemonModifier('carrySize', '+', 2, {
conditions: [{
type: 'equals',
field: 'remainingEvolutions',
value: 0
}]
})

// Middle evolution bonus
.addPokemonModifier('frequency', '\*', 1.1, {
conditions: [
{
type: 'greater',
field: 'previousEvolutions',
value: 0
},
{
type: 'greater',
field: 'remainingEvolutions',
value: 0
}
]
})
.withMetadata({
category: 'special',
rarity: 'epic',
tags: ['evolution', 'progressive', 'skill'],
icon: 'evolution',
color: '#9C27B0',
priority: 150
})
.build();

// Weekend event
export const weekendBoostEvent: Event = new EventBuilder(
'weekend-boost',
'Weekend Boost',
'Extra rewards on weekends'
)
.addPokemonModifier('frequency', '_', 1.25)
.addPokemonInstanceModifier('experienceGain', '_', 1.5)
.addUserModifier('eventTokens', '+', 5)
.withRecurrence({
type: 'weekly',
daysOfWeek: [0, 6] // Sunday and Saturday
})
.withMetadata({
category: 'weekly',
rarity: 'uncommon',
tags: ['weekend', 'boost', 'recurring'],
icon: 'weekend',
color: '#FF9800'
})
.build();

// Get all active events for a given date
export function getActiveEvents(date: Date = new Date()): Event[] {
const allEvents = [
ingredientSpecialistEvent,
berryFrenzyEvent,
dailyLoginBonus,
evolutionAdvantageEvent,
weekendBoostEvent
];

return allEvents.filter(event => {
if (!event.enabled) return false;
if (event.draft) return false;
if (event.startDate && date < event.startDate) return false;
if (event.endDate && date > event.endDate) return false;

    // Check recurrence
    if (event.recurrence) {
      const dayOfWeek = date.getDay();
      if (event.recurrence.type === 'weekly' && event.recurrence.daysOfWeek) {
        return event.recurrence.daysOfWeek.includes(dayOfWeek);
      }
      // Add more recurrence logic as needed
    }

    return true;

});
}
File: backend/src/events/utils/event-serializer.ts
typescriptimport { Event, SerializableModifier } from '@your-org/common/types/events';

/\*\*

- Utilities for serializing and deserializing events
- Used for saving user-created events to database
  \*/

export class EventSerializer {
/\*\*

- Prepare an event for database storage
  \*/
  static serialize(event: Event): string {
  return JSON.stringify(event);
  }

/\*\*

- Restore an event from database
  \*/
  static deserialize(data: string): Event {
  const parsed = JSON.parse(data);


    // Convert date strings back to Date objects
    if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
    if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);

    return parsed as Event;

}

/\*\*

- Validate a serialized event
  \*/
  static validate(event: Event): { valid: boolean; errors: string[] } {
  const errors: string[] = [];


    if (!event.id) errors.push('Event must have an ID');
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

/\*\*

- Sanitize user input for an event
  \*/
  static sanitize(event: Partial<Event>): Event {
  const sanitized: Event = {
  id: event.id || `user-event-${Date.now()}`,
  name: (event.name || 'Untitled Event').substring(0, 100),
  description: (event.description || '').substring(0, 500),
  modifiers: event.modifiers || [],
  createdAt: event.createdAt || new Date(),
  updatedAt: new Date(),
  enabled: false, // User events start disabled
  draft: true, // User events start as drafts
  approved: false, // Require approval
  category: 'user-created',
  tags: event.tags?.slice(0, 10) || [], // Limit tags
  };


    // Sanitize modifiers
    sanitized.modifiers = sanitized.modifiers.map(mod => ({
      targetType: mod.targetType,
      path: mod.path.substring(0, 100),
      operation: mod.operation,
      value: typeof mod.value === 'number' ? mod.value : undefined,
      conditions: mod.conditions?.slice(0, 5), // Limit conditions
      probability: mod.probability !== undefined
        ? Math.max(0, Math.min(1, mod.probability))
        : undefined
    }));

    return sanitized;

}
}
File: backend/src/events/index.ts
typescript/\*\*

- Main export for backend event system
  \*/

// Engine
export \* from './engine/modifier-engine';

// Builders
export \* from './builders/event-builder';

// Predefined events
export \* from './events/predefined-events';

// Utils
export \* from './utils/event-serializer';

// Re-export common types for convenience
export type {
Event,
EventContext,
EventResult,
SerializableModifier,
ModifierCondition
} from '@your-org/common/types/events';
Part 3: Frontend Implementation Guide
File: frontend/src/features/events/hooks/useEventBuilder.ts
typescriptimport { useState, useCallback } from 'react';
import {
Event,
SerializableModifier,
ModifierCondition,
ModifierOperation,
ModifierTargetType,
EventCategory
} from '@your-org/common/types/events';

/\*\*

- React hook for building events in the UI
  \*/

export function useEventBuilder(initialEvent?: Partial<Event>) {
const [event, setEvent] = useState<Partial<Event>>({
name: '',
description: '',
modifiers: [],
category: 'user-created' as EventCategory,
enabled: false,
draft: true,
...initialEvent
});

const [errors, setErrors] = useState<string[]>([]);

const updateEventInfo = useCallback((updates: Partial<Event>) => {
setEvent(prev => ({ ...prev, ...updates }));
}, []);

const addModifier = useCallback((modifier: SerializableModifier) => {
setEvent(prev => ({
...prev,
modifiers: [...(prev.modifiers || []), modifier]
}));
}, []);

const updateModifier = useCallback((index: number, updates: Partial<SerializableModifier>) => {
setEvent(prev => {
const modifiers = [...(prev.modifiers || [])];
modifiers[index] = { ...modifiers[index], ...updates };
return { ...prev, modifiers };
});
}, []);

const removeModifier = useCallback((index: number) => {
setEvent(prev => ({
...prev,
modifiers: prev.modifiers?.filter((\_, i) => i !== index) || []
}));
}, []);

const addCondition = useCallback((modifierIndex: number, condition: ModifierCondition) => {
setEvent(prev => {
const modifiers = [...(prev.modifiers || [])];
const modifier = modifiers[modifierIndex];
if (modifier) {
modifier.conditions = [...(modifier.conditions || []), condition];
}
return { ...prev, modifiers };
});
}, []);

const validate = useCallback((): boolean => {
const newErrors: string[] = [];

    if (!event.name) newErrors.push('Event name is required');
    if (!event.description) newErrors.push('Event description is required');
    if (!event.modifiers || event.modifiers.length === 0) {
      newErrors.push('At least one modifier is required');
    }

    event.modifiers?.forEach((mod, i) => {
      if (!mod.targetType) newErrors.push(`Modifier ${i + 1}: Target type is required`);
      if (!mod.path) newErrors.push(`Modifier ${i + 1}: Path is required`);
      if (!mod.operation) newErrors.push(`Modifier ${i + 1}: Operation is required`);
      if (mod.operation !== '=' && mod.value === undefined) {
        newErrors.push(`Modifier ${i + 1}: Value is required for ${mod.operation} operation`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;

}, [event]);

const build = useCallback((): Event | null => {
if (!validate()) return null;

    return {
      id: event.id || `user-event-${Date.now()}`,
      name: event.name!,
      description: event.description!,
      modifiers: event.modifiers!,
      category: event.category || 'user-created',
      enabled: event.enabled || false,
      draft: event.draft !== false,
      approved: false,
      createdAt: event.createdAt || new Date(),
      updatedAt: new Date(),
      tags: event.tags || []
    };

}, [event, validate]);

const reset = useCallback(() => {
setEvent({
name: '',
description: '',
modifiers: [],
category: 'user-created' as EventCategory,
enabled: false,
draft: true
});
setErrors([]);
}, []);

return {
event,
errors,
updateEventInfo,
addModifier,
updateModifier,
removeModifier,
addCondition,
validate,
build,
reset
};
}
File: frontend/src/features/events/components/EventCreator.tsx
typescriptimport React from 'react';
import { useEventBuilder } from '../hooks/useEventBuilder';
import { ModifierBuilder } from './ModifierBuilder';
import {
Event,
EventCategory,
EventRarity
} from '@your-org/common/types/events';

interface EventCreatorProps {
onSave: (event: Event) => void;
onCancel: () => void;
initialEvent?: Partial<Event>;
}

export const EventCreator: React.FC<EventCreatorProps> = ({
onSave,
onCancel,
initialEvent
}) => {
const {
event,
errors,
updateEventInfo,
addModifier,
updateModifier,
removeModifier,
build,
reset
} = useEventBuilder(initialEvent);

const handleSave = () => {
const builtEvent = build();
if (builtEvent) {
onSave(builtEvent);
reset();
}
};

return (
<div className="event-creator">
<h2>Create Event</h2>

      {/* Event Info */}
      <div className="event-info">
        <input
          type="text"
          placeholder="Event Name"
          value={event.name || ''}
          onChange={(e) => updateEventInfo({ name: e.target.value })}
        />

        <textarea
          placeholder="Event Description"
          value={event.description || ''}
          onChange={(e) => updateEventInfo({ description: e.target.value })}
        />

        <select
          value={event.category || 'user-created'}
          onChange={(e) => updateEventInfo({ category: e.target.value as EventCategory })}
        >
          <option value="user-created">User Created</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="special">Special</option>
        </select>
      </div>

      {/* Modifiers */}
      <div className="modifiers">
        <h3>Modifiers</h3>
        {event.modifiers?.map((modifier, index) => (
          <ModifierBuilder
            key={index}
            modifier={modifier}
            onChange={(updated) => updateModifier(index, updated)}
            onRemove={() => removeModifier(index)}
          />
        ))}

        <button onClick={() => addModifier({
          targetType: 'Pokemon',
          path: '',
          operation: '+',
          value: 0
        })}>
          Add Modifier
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <div key={i} className="error">{error}</div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button onClick={handleSave}>Save Event</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>

);
};
Part 4: Usage Examples
Backend Simulation Usage
typescript// backend/src/simulation/event-runner.ts
import { ModifierEngine, getActiveEvents } from '../events';
import { EventContext } from '@your-org/common/types/events';

export class EventRunner {
private engine = new ModifierEngine({ debug: true });

async runDailyEvents(context: EventContext): Promise<void> {
const events = getActiveEvents(new Date());

    console.log(`Running ${events.length} active events`);

    const results = await this.engine.applyEvents(context, events);

    results.forEach(result => {
      console.log(`Event ${result.eventName}: ${result.appliedModifiers} modifiers applied`);
      if (result.errors.length > 0) {
        console.error(`Errors:`, result.errors);
      }
    });

}

async applyUserEvent(
context: EventContext,
eventData: string
): Promise<EventContext> {
const event = JSON.parse(eventData);
const result = await this.engine.applyEvent(context, event);

    if (!result.success) {
      throw new Error(`Failed to apply event: ${result.errors.join(', ')}`);
    }

    return result.context;

}
}
API Endpoint Example
typescript// backend/src/api/events.controller.ts
import { Request, Response } from 'express';
import { EventSerializer, ModifierEngine } from '../events';
import { Event } from '@your-org/common/types/events';

export class EventsController {
private engine = new ModifierEngine();

// Create user event
async createEvent(req: Request, res: Response) {
try {
const eventData: Partial<Event> = req.body;
const sanitized = EventSerializer.sanitize(eventData);
const validation = EventSerializer.validate(sanitized);

      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }

      // Save to database
      const saved = await this.saveEvent(sanitized);

      res.json({ success: true, event: saved });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

}

// Test event on user's data
async testEvent(req: Request, res: Response) {
try {
const { eventId, context } = req.body;
const event = await this.loadEvent(eventId);

      const result = await this.engine.applyEvent(context, event);

      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

}

private async saveEvent(event: Event): Promise<Event> {
// Your database logic
return event;
}

private async loadEvent(id: string): Promise<Event> {
// Your database logic
throw new Error('Not implemented');
}
}
Implementation Checklist

Common Package

Add event types to common/src/types/events/
Export from main index
Build and publish common package

Backend

Implement ModifierEngine
Create EventBuilder
Add predefined events
Set up event serializer
Create API endpoints
Add to simulation logic

Frontend

Create useEventBuilder hook
Build EventCreator component
Build ModifierBuilder component
Add event management UI
Connect to backend API

Testing

Unit tests for ModifierEngine
Integration tests for events
E2E tests for user event creation

Documentation

API documentation
Event creation guide for users
Developer guide for adding new events

Notes for Implementation

Type Safety: The system uses TypeScript generics to maintain type safety while being flexible
Performance: The engine uses structuredClone for deep cloning - ensure Node.js 17+ or add polyfill
Security: Always sanitize user-created events before applying
Debugging: Enable debug mode in ModifierEngine for development
Database: Store events as JSON, use EventSerializer for validation
Frontend: Keep complex logic in hooks, components should be presentational
Testing: Focus on edge cases like wildcard paths, nested conditions, probability

This architecture ensures clean separation between shared types, backend logic, and frontend UI while maintaining type safety throughout!
