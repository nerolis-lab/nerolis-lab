/**
 * Demonstration of Type-Safe EventBuilder
 *
 * This file showcases the enhanced EventBuilder that supports both
 * legacy string-based paths and new type-safe paths.
 */

import { EventBuilder } from '../builders/event-builder.js';
import type { Event } from 'sleepapi-common';

// =================== TYPE-SAFE EVENT BUILDER EXAMPLES ===================

// Example 1: Using the new type-safe Pokemon modifier methods
const typeSafeIngredientEvent: Event = new EventBuilder(
  'Type-Safe Ingredient Boost',
  'All Pokemon get +1 ingredient using type-safe paths'
)
  // ✅ Type-safe paths with IntelliSense support
  .addTypedPokemonModifier('ingredient0.*.amount', '+', 1)
  .addTypedPokemonModifier('ingredient30.*.amount', '+', 1)
  .addTypedPokemonModifier('ingredient60.*.amount', '+', 1)

  // ✅ Type-safe conditional modifier for berry specialists
  .addTypedPokemonModifier('frequency', '*', 0.85, {
    conditions: [
      {
        type: 'equals',
        field: 'specialty', // ✅ Type-safe condition field
        value: 'berry'
      }
    ]
  })
  .build();

// Example 2: Using the generic type-safe modifier method
const genericTypeSafeEvent: Event = new EventBuilder(
  'Generic Type-Safe Event',
  'Demonstrates generic type-safe modifier usage'
)
  // ✅ Generic type-safe method with explicit target type
  .addTypedModifier('Pokemon', 'carrySize', '+', 2)
  .addTypedModifier('Pokemon', 'skillPercentage', '+', 5)
  .addTypedModifier('PokemonInstance', 'level', '+', 1)
  .addTypedModifier('User', 'name', '=', 1) // Note: Would need proper value in real usage
  .build();

// Example 3: Complex type-safe event with multiple target types
const multiTargetTypeSafeEvent: Event = new EventBuilder(
  'Multi-Target Type-Safe Event',
  'Event affecting Pokemon, PokemonInstance, and User with type safety'
)
  // Pokemon modifications
  .addTypedPokemonModifier('frequency', '*', 0.9)
  .addTypedPokemonModifier('berry.name', '=', 1) // Nested object access

  // PokemonInstance modifications
  .addTypedPokemonInstanceModifier('level', '+', 3)
  .addTypedPokemonInstanceModifier('carrySize', '+', 1)

  // User modifications
  .addTypedUserModifier('friend_code', '=', 1)
  .build();

// Example 4: Probability-based type-safe event
const probabilityTypeSafeEvent: Event = new EventBuilder(
  'Lucky Type-Safe Event',
  'Type-safe event with probability mechanics'
)
  .addTypedPokemonModifier('carrySize', '+', 5, {
    probability: 0.3 // 30% chance
  })
  .addTypedPokemonModifier('frequency', '*', 0.7, {
    probability: 0.1, // 10% chance for major boost
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: 'skill'
      }
    ]
  })
  .build();

// =================== BACKWARD COMPATIBILITY EXAMPLES ===================

// Example 5: Legacy string-based methods still work
const legacyEvent: Event = new EventBuilder(
  'Legacy String Event',
  'Demonstrates backward compatibility with string paths'
)
  // ❌ Legacy string paths (no type safety, but still functional)
  .addPokemonModifier('frequency', '*', 0.8)
  .addPokemonModifier('carrySize', '+', 2)
  .addPokemonInstanceModifier('level', '+', 1)
  .build();

// Example 6: Mixed usage - legacy and type-safe in same event
const mixedEvent: Event = new EventBuilder(
  'Mixed Legacy and Type-Safe Event',
  'Shows that legacy and type-safe methods can be used together'
)
  // ✅ Type-safe methods
  .addTypedPokemonModifier('frequency', '*', 0.9)
  .addTypedPokemonModifier('ingredient0.*.amount', '+', 1)

  // ❌ Legacy methods (still work for gradual migration)
  .addPokemonModifier('carrySize', '+', 2)
  .addPokemonInstanceModifier('level', '+', 1)
  .build();

// =================== ADVANCED TYPE-SAFE PATTERNS ===================

// Example 7: Builder pattern with method chaining and type safety
function createSpecialtyBoostEvent(specialty: 'berry' | 'ingredient' | 'skill'): Event {
  const builder = new EventBuilder(
    `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} Specialist Boost`,
    `Enhanced bonuses for ${specialty} specialist Pokemon`
  );

  // Base bonuses for all Pokemon
  builder.addTypedPokemonModifier('carrySize', '+', 1);

  // Specialty-specific bonuses with type safety
  switch (specialty) {
    case 'berry':
      builder
        .addTypedPokemonModifier('frequency', '*', 0.8, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'berry' }]
        })
        .addTypedPokemonModifier('berry.name', '=', 1, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'berry' }]
        });
      break;

    case 'ingredient':
      builder
        .addTypedPokemonModifier('ingredient0.*.amount', '+', 2, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'ingredient' }]
        })
        .addTypedPokemonModifier('ingredient30.*.amount', '+', 2, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'ingredient' }]
        });
      break;

    case 'skill':
      builder
        .addTypedPokemonModifier('skillPercentage', '+', 10, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'skill' }]
        })
        .addTypedPokemonModifier('skill.maxLevel', '+', 1, {
          conditions: [{ type: 'equals', field: 'specialty', value: 'skill' }]
        });
      break;
  }

  return builder.build();
}

// Usage examples:
const berrySpecialistEvent = createSpecialtyBoostEvent('berry');
const ingredientSpecialistEvent = createSpecialtyBoostEvent('ingredient');
const skillSpecialistEvent = createSpecialtyBoostEvent('skill');

// Example 8: Conditional modifier factory with type safety
function createConditionalPokemonEvent(
  name: string,
  description: string,
  targetPath: 'frequency' | 'carrySize' | 'skillPercentage',
  operation: '*' | '+' | '-',
  value: number,
  conditionField: 'specialty' | 'name',
  conditionValue: unknown
): Event {
  return new EventBuilder(name, description)
    .addTypedPokemonModifier(targetPath, operation, value, {
      conditions: [
        {
          type: 'equals',
          field: conditionField,
          value: conditionValue
        }
      ]
    })
    .build();
}

// Usage examples:
const fastBerryEvent = createConditionalPokemonEvent(
  'Fast Berry Collectors',
  'Berry specialists get 15% speed boost',
  'frequency',
  '*',
  0.85,
  'specialty',
  'berry'
);

const bigCarryEvent = createConditionalPokemonEvent(
  'Big Carry Capacity',
  'All Snorlax get +3 carry capacity',
  'carrySize',
  '+',
  3,
  'name',
  'Snorlax'
);

// =================== COMPILE-TIME SAFETY DEMONSTRATION ===================

// These examples show compile-time errors that would be caught with type-safe methods:

/*
// ❌ TypeScript Error: 'invalidPath' is not assignable to type PokemonPath
const invalidEvent = new EventBuilder('Invalid', 'This will cause a TypeScript error')
  .addTypedPokemonModifier('invalidPath', '+', 1) // Compilation error!
  .build();

// ❌ TypeScript Error: 'level' is not a valid Pokemon path
const wrongTargetEvent = new EventBuilder('Wrong Target', 'This will cause a TypeScript error')
  .addTypedPokemonModifier('level', '+', 1) // Compilation error! 'level' is for PokemonInstance
  .build();

// ❌ TypeScript Error: Cannot use PokemonInstance path with Pokemon target
const typeMismatchEvent = new EventBuilder('Type Mismatch', 'This will cause a TypeScript error')
  .addTypedModifier('Pokemon', 'ribbon', '+', 1) // Compilation error! 'ribbon' is PokemonInstance field
  .build();
*/

// =================== RUNTIME VALIDATION EXAMPLES ===================

// Example 9: Event array with mixed type-safe and legacy events
const eventCollection: Event[] = [
  typeSafeIngredientEvent,
  genericTypeSafeEvent,
  legacyEvent,
  mixedEvent,
  berrySpecialistEvent,
  fastBerryEvent
];

// Example 10: Dynamic event creation with type safety
function createDynamicEventWithTypeSafety(eventType: 'frequency' | 'carry' | 'skill', multiplier: number): Event {
  const pathMap = {
    frequency: 'frequency' as const,
    carry: 'carrySize' as const,
    skill: 'skillPercentage' as const
  };

  return new EventBuilder(`Dynamic ${eventType} Event`, `Dynamically created ${eventType} boost event`)
    .addTypedPokemonModifier(
      pathMap[eventType], // ✅ Type-safe dynamic path selection
      eventType === 'frequency' ? '*' : '+',
      eventType === 'frequency' ? 1 - multiplier : multiplier
    )
    .build();
}

// Usage examples:
const dynamicFrequencyEvent = createDynamicEventWithTypeSafety('frequency', 0.2); // 20% faster
const dynamicCarryEvent = createDynamicEventWithTypeSafety('carry', 3); // +3 carry
const dynamicSkillEvent = createDynamicEventWithTypeSafety('skill', 7); // +7% skill

// Export all examples for testing and documentation
export {
  typeSafeIngredientEvent,
  genericTypeSafeEvent,
  multiTargetTypeSafeEvent,
  probabilityTypeSafeEvent,
  legacyEvent,
  mixedEvent,
  createSpecialtyBoostEvent,
  berrySpecialistEvent,
  ingredientSpecialistEvent,
  skillSpecialistEvent,
  createConditionalPokemonEvent,
  fastBerryEvent,
  bigCarryEvent,
  eventCollection,
  createDynamicEventWithTypeSafety,
  dynamicFrequencyEvent,
  dynamicCarryEvent,
  dynamicSkillEvent
};

// =================== MIGRATION GUIDE ===================

/*
🔄 MIGRATION FROM LEGACY TO TYPE-SAFE PATHS:

BEFORE (Legacy):
```typescript
const event = new EventBuilder('My Event', 'Description')
  .addPokemonModifier('frequency', '*', 0.8)          // ❌ No type safety
  .addPokemonModifier('carrySize', '+', 2)            // ❌ No type safety
  .addPokemonModifier('ingredient0.*.amount', '+', 1) // ❌ No type safety
  .build();
```

AFTER (Type-Safe):
```typescript
const event = new EventBuilder('My Event', 'Description')
  .addTypedPokemonModifier('frequency', '*', 0.8)          // ✅ Type-safe with IntelliSense
  .addTypedPokemonModifier('carrySize', '+', 2)            // ✅ Type-safe with IntelliSense
  .addTypedPokemonModifier('ingredient0.*.amount', '+', 1) // ✅ Type-safe with IntelliSense
  .build();
```

🚀 GRADUAL MIGRATION STRATEGY:

1. **Phase 1**: Start using type-safe methods for new events
2. **Phase 2**: Convert existing events one-by-one when modifying them
3. **Phase 3**: Create linting rules to enforce type-safe methods
4. **Phase 4**: Eventually deprecate legacy methods

🎯 BENEFITS:

✅ **Immediate feedback**: IDE shows errors as you type
✅ **IntelliSense support**: Autocomplete for valid paths
✅ **Refactoring safety**: Renaming fields updates all references
✅ **Zero runtime overhead**: Type safety is compile-time only
✅ **Backward compatibility**: Legacy code continues to work
✅ **Gradual adoption**: Can be introduced incrementally
*/
