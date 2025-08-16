/**
 * Demonstration of Type-Safe Path Selectors for Modifiers
 *
 * This file showcases the new type-safe path system that provides
 * IntelliSense support and compile-time validation for modifier paths.
 */

import type {
  PokemonModifier,
  PokemonInstanceModifier,
  UserModifier,
  PokemonPath,
  PokemonInstancePath,
  UserPath,
  TypedSerializableModifier,
  PokemonCondition
} from 'sleepapi-common';

// =================== POKEMON MODIFIERS ===================

// Example 1: Basic Pokemon property modification
const pokemonFrequencyModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'frequency', // ✅ Type-safe! IntelliSense will suggest valid paths
  operation: '*',
  value: 0.8
};

// Example 2: Nested object modification
const pokemonBerryModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'berry.name', // ✅ Type-safe nested access
  operation: '=',
  value: 1
};

// Example 3: Array access with index
const pokemonIngredientModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'ingredient0.0.amount', // ✅ Type-safe array index access
  operation: '+',
  value: 2
};

// Example 4: Array access with wildcard (affects all elements)
const pokemonAllIngredientsModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'ingredient0.*.amount', // ✅ Type-safe wildcard access
  operation: '+',
  value: 1
};

// Example 5: Complex nested array modification
const pokemonIngredientNameModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'ingredient30.*.ingredient.name', // ✅ Deep nested access
  operation: '=',
  value: 1
};

// =================== POKEMON INSTANCE MODIFIERS ===================

// Example 6: Pokemon instance level modification
const pokemonInstanceLevelModifier: PokemonInstanceModifier = {
  targetType: 'PokemonInstance',
  path: 'level', // ✅ Type-safe PokemonInstance paths
  operation: '+',
  value: 5
};

// Example 7: Pokemon instance nature modification
const pokemonInstanceNatureModifier: PokemonInstanceModifier = {
  targetType: 'PokemonInstance',
  path: 'nature', // ✅ IntelliSense shows available PokemonInstance fields
  operation: '=',
  value: 1 // Note: This would need proper nature value in real usage
};

// =================== USER MODIFIERS ===================

// Example 8: User profile modification
const userModifier: UserModifier = {
  targetType: 'User',
  path: 'name', // ✅ Type-safe User paths
  operation: '=',
  value: 1
};

// =================== TYPE-SAFE CONDITIONS ===================

// Example 9: Modifier with type-safe conditions
const conditionalModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'carrySize',
  operation: '+',
  value: 3,
  conditions: [
    {
      type: 'equals',
      field: 'specialty', // ✅ Type-safe condition field
      value: 'berry'
    },
    {
      type: 'greater',
      field: 'frequency', // ✅ IntelliSense suggests valid Pokemon fields
      value: 2000
    }
  ]
};

// =================== HELPER FUNCTIONS ===================

// Example 10: Generic modifier creator with type safety
function createPokemonModifier<T extends PokemonPath>(
  path: T,
  operation: '*' | '+' | '-' | '/' | '=',
  value: number
): PokemonModifier {
  return {
    targetType: 'Pokemon',
    path, // ✅ Type-safe path parameter
    operation,
    value
  };
}

// Usage examples:
const frequencyBoost = createPokemonModifier('frequency', '*', 0.9);
const carryIncrease = createPokemonModifier('carrySize', '+', 2);
const ingredientBoost = createPokemonModifier('ingredient0.*.amount', '+', 1);

// Example 11: Conditional modifier creator
function createConditionalPokemonModifier(
  path: PokemonPath,
  operation: '*' | '+' | '-' | '/' | '=',
  value: number,
  conditionField: PokemonPath,
  conditionValue: unknown
): PokemonModifier {
  return {
    targetType: 'Pokemon',
    path,
    operation,
    value,
    conditions: [
      {
        type: 'equals',
        field: conditionField, // ✅ Type-safe condition field
        value: conditionValue
      }
    ]
  };
}

// Usage example:
const berrySpecialistBoost = createConditionalPokemonModifier('frequency', '*', 0.8, 'specialty', 'berry');

// =================== COMPILE-TIME ERROR EXAMPLES ===================

// These examples will cause TypeScript compilation errors, demonstrating type safety:

/* 
// ❌ Error: 'invalidField' is not a valid Pokemon path
const invalidModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'invalidField', // TypeScript error!
  operation: '+',
  value: 1
};

// ❌ Error: 'level' is not a valid Pokemon path (it's a PokemonInstance path)
const wrongTargetModifier: PokemonModifier = {
  targetType: 'Pokemon',
  path: 'level', // TypeScript error! Level is on PokemonInstance, not Pokemon
  operation: '+',
  value: 1
};

// ❌ Error: Type mismatch between target type and path
const typeMismatchModifier: UserModifier = {
  targetType: 'User',
  path: 'frequency', // TypeScript error! frequency is not a User field
  operation: '+',
  value: 1
};
*/

// =================== RUNTIME USAGE EXAMPLES ===================

// Example 12: Array of type-safe modifiers
const pokemonModifiers: PokemonModifier[] = [
  {
    targetType: 'Pokemon',
    path: 'frequency',
    operation: '*',
    value: 0.9
  },
  {
    targetType: 'Pokemon',
    path: 'carrySize',
    operation: '+',
    value: 2
  },
  {
    targetType: 'Pokemon',
    path: 'ingredient0.*.amount',
    operation: '+',
    value: 1
  }
];

// Example 13: Dynamic modifier creation based on specialty
function createSpecialtyBoostModifier(specialty: 'berry' | 'ingredient' | 'skill'): PokemonModifier {
  const pathMap = {
    berry: 'frequency' as const,
    ingredient: 'ingredient0.*.amount' as const,
    skill: 'skillPercentage' as const
  };

  return {
    targetType: 'Pokemon',
    path: pathMap[specialty], // ✅ Type-safe dynamic path selection
    operation: specialty === 'berry' ? '*' : '+',
    value: specialty === 'berry' ? 0.85 : 2,
    conditions: [
      {
        type: 'equals',
        field: 'specialty',
        value: specialty
      }
    ]
  };
}

// Export examples for use in tests or documentation
export {
  pokemonFrequencyModifier,
  pokemonBerryModifier,
  pokemonIngredientModifier,
  pokemonAllIngredientsModifier,
  conditionalModifier,
  createPokemonModifier,
  createConditionalPokemonModifier,
  berrySpecialistBoost,
  pokemonModifiers,
  createSpecialtyBoostModifier
};

// =================== BENEFITS SUMMARY ===================

/*
🎯 BENEFITS OF TYPE-SAFE PATH SELECTORS:

1. **IntelliSense Support**: IDEs can provide autocomplete for valid paths
2. **Compile-time Validation**: Catch invalid paths before runtime
3. **Refactoring Safety**: Renaming fields will update all references
4. **Documentation**: Type system serves as living documentation
5. **Reduced Bugs**: Eliminates typos in path strings
6. **Better Developer Experience**: Faster development with confidence

🔧 SUPPORTED FEATURES:

✅ Direct property access: 'frequency', 'carrySize'
✅ Nested object access: 'berry.name', 'skill.maxLevel'
✅ Array index access: 'ingredient0.0.amount'
✅ Array wildcard access: 'ingredient0.*.amount'
✅ Deep nested paths: 'ingredient30.*.ingredient.name'
✅ Conditional modifiers with type-safe field names
✅ Multiple target types: Pokemon, PokemonInstance, User

🚀 MIGRATION STRATEGY:

- Backward compatible: Old string-based modifiers still work
- Gradual adoption: Can be introduced incrementally
- Type coercion: Can cast between typed and untyped modifiers when needed
- Helper functions: Can create utilities to ease the transition
*/
