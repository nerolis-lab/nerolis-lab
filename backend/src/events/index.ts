/**
 * Main export for backend event system
 */

// Engine
export * from './engine/modifier-engine.js';

// Builders
export * from './builders/event-builder.js';

// Predefined events
export * from './events/predefined-events.js';

// Utils
export * from './utils/event-serializer.js';

// Re-export common types for convenience
export type { Event, EventContext, EventResult, SerializableModifier, ModifierCondition } from 'sleepapi-common';
