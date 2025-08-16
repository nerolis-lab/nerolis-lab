import { describe, expect, expectTypeOf, it } from 'vitest';
import { mockModifier, mockModifierCondition, mockModifierWithCondition } from '../../vitest/mocks';
import type {
  Modifier,
  ModifierOperation,
  ConditionOperation,
  ModifierCondition,
  PokemonPath,
  PokemonInstancePath,
  PokemonModifier,
  PokemonInstanceModifier,
  PokemonCondition,
  PokemonInstanceCondition
} from './modifier';

describe('Modifier types', () => {
  describe('ModifierOperation', () => {
    it('should only allow valid operations', () => {
      const validOperations: ModifierOperation[] = ['*', '+', '-', '/', '='];
      expect(validOperations).toEqual(['*', '+', '-', '/', '=']);

      type ExpectedOperations = '*' | '+' | '-' | '/' | '=';
      expectTypeOf<ModifierOperation>().toEqualTypeOf<ExpectedOperations>();
    });

    it('should handle each operation type', () => {
      const multiply: ModifierOperation = '*';
      const add: ModifierOperation = '+';
      const subtract: ModifierOperation = '-';
      const divide: ModifierOperation = '/';
      const set: ModifierOperation = '=';

      expect(multiply).toBe('*');
      expect(add).toBe('+');
      expect(subtract).toBe('-');
      expect(divide).toBe('/');
      expect(set).toBe('=');
    });
  });

  describe('Modifier interface', () => {
    it('should create a valid modifier', () => {
      const modifier: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9
      };

      expect(modifier.path).toBe('frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.value).toBe(0.9);
    });

    it('should handle different operations', () => {
      const modifiers: Modifier[] = [
        { path: 'frequency', operation: '+', value: 100 },
        { path: 'frequency', operation: '-', value: 50 },
        { path: 'frequency', operation: '*', value: 1.5 },
        { path: 'frequency', operation: '/', value: 2 },
        { path: 'frequency', operation: '=', value: 2400 }
      ];

      expect(modifiers).toHaveLength(5);
      expect(modifiers[0].operation).toBe('+');
      expect(modifiers[1].operation).toBe('-');
      expect(modifiers[2].operation).toBe('*');
      expect(modifiers[3].operation).toBe('/');
      expect(modifiers[4].operation).toBe('=');
    });

    it('should handle negative values', () => {
      const modifier: Modifier = {
        path: 'frequency',
        operation: '+',
        value: -100
      };

      expect(modifier.value).toBe(-100);
    });

    it('should handle decimal values', () => {
      const modifier: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.75
      };

      expect(modifier.value).toBe(0.75);
    });
  });

  describe('PokemonPath type alias', () => {
    it('should allow valid Pokemon paths', () => {
      const validPaths: PokemonPath[] = [
        'name',
        'frequency',
        'specialty',
        'berry',
        'berry.name',
        'berry.power',
        'ingredient0.*.amount',
        'skillPercentage',
        'ingredientPercentage'
      ];

      expect(validPaths).toContain('frequency');
      expect(validPaths).toContain('berry.power');
    });

    it('should work with nested paths', () => {
      const nestedPath: PokemonPath = 'berry.name';
      const arrayPath: PokemonPath = 'ingredient0.0.amount';
      const wildcardPath: PokemonPath = 'ingredient30.*.amount';

      expect(nestedPath).toBe('berry.name');
      expect(arrayPath).toBe('ingredient0.0.amount');
      expect(wildcardPath).toBe('ingredient30.*.amount');
    });
  });

  describe('PokemonInstancePath type alias', () => {
    it('should allow valid PokemonInstance paths', () => {
      const validPaths: PokemonInstancePath[] = [
        'pokemon',
        'level',
        'ribbon',
        'carrySize',
        'skillLevel',
        'nature',
        'subskills.*.id',
        'ingredients.*.amount'
      ];

      expect(validPaths).toContain('level');
      expect(validPaths).toContain('subskills.*.id');
    });

    it('should work with array notation', () => {
      const indexPath: PokemonInstancePath = 'subskills.0';
      const nestedIndexPath: PokemonInstancePath = 'subskills.0.level';
      const wildcardPath: PokemonInstancePath = 'ingredients.*.amount';

      expect(indexPath).toBe('subskills.0');
      expect(nestedIndexPath).toBe('subskills.0.level');
      expect(wildcardPath).toBe('ingredients.*.amount');
    });
  });

  describe('PokemonModifier type alias', () => {
    it('should create valid Pokemon modifiers', () => {
      const modifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.8
      };

      expect(modifier.path).toBe('frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.value).toBe(0.8);
    });

    it('should handle berry modifiers', () => {
      const berryModifier: PokemonModifier = {
        path: 'berry.power',
        operation: '+',
        value: 5
      };

      expect(berryModifier.path).toBe('berry.power');
      expect(berryModifier.operation).toBe('+');
      expect(berryModifier.value).toBe(5);
    });

    it('should handle ingredient modifiers', () => {
      const ingredientModifier: PokemonModifier = {
        path: 'ingredient0.*.amount',
        operation: '*',
        value: 2
      };

      expect(ingredientModifier.path).toBe('ingredient0.*.amount');
      expect(ingredientModifier.value).toBe(2);
    });

    it('should handle skill and ingredient percentage modifiers', () => {
      const skillModifier: PokemonModifier = {
        path: 'skillPercentage',
        operation: '+',
        value: 0.1
      };

      const ingredientPercentageModifier: PokemonModifier = {
        path: 'ingredientPercentage',
        operation: '*',
        value: 1.2
      };

      expect(skillModifier.path).toBe('skillPercentage');
      expect(ingredientPercentageModifier.path).toBe('ingredientPercentage');
    });
  });

  describe('PokemonInstanceModifier type alias', () => {
    it('should create valid PokemonInstance modifiers', () => {
      const modifier: PokemonInstanceModifier = {
        path: 'level',
        operation: '+',
        value: 5
      };

      expect(modifier.path).toBe('level');
      expect(modifier.operation).toBe('+');
      expect(modifier.value).toBe(5);
    });

    it('should handle subskill modifiers', () => {
      const subskillModifier: PokemonInstanceModifier = {
        path: 'subskills.*.level',
        operation: '=',
        value: 10
      };

      expect(subskillModifier.path).toBe('subskills.*.level');
      expect(subskillModifier.operation).toBe('=');
      expect(subskillModifier.value).toBe(10);
    });

    it('should handle carry size and skill level modifiers', () => {
      const carrySizeModifier: PokemonInstanceModifier = {
        path: 'carrySize',
        operation: '+',
        value: 10
      };

      const skillLevelModifier: PokemonInstanceModifier = {
        path: 'skillLevel',
        operation: '=',
        value: 6
      };

      expect(carrySizeModifier.path).toBe('carrySize');
      expect(skillLevelModifier.path).toBe('skillLevel');
    });
  });

  describe('Mock factory integration', () => {
    it('should create modifiers using mock factory', () => {
      const modifier = mockModifier();

      expect(modifier).toBeDefined();
      expect(modifier.path).toBe('frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.value).toBe(0.9);
    });

    it('should override mock factory defaults', () => {
      const customModifier = mockModifier({
        path: 'level',
        operation: '+',
        value: 10
      });

      expect(customModifier.path).toBe('level');
      expect(customModifier.operation).toBe('+');
      expect(customModifier.value).toBe(10);
    });

    it('should create Pokemon-specific modifiers', () => {
      const pokemonModifier = mockModifier<'Pokemon'>({
        path: 'berry.power',
        operation: '*',
        value: 1.5
      });

      expect(pokemonModifier.path).toBe('berry.power');
      expect(pokemonModifier.operation).toBe('*');
      expect(pokemonModifier.value).toBe(1.5);
    });

    it('should create PokemonInstance-specific modifiers', () => {
      const instanceModifier = mockModifier<'PokemonInstance'>({
        path: 'level',
        operation: '=',
        value: 50
      });

      expect(instanceModifier.path).toBe('level');
      expect(instanceModifier.operation).toBe('=');
      expect(instanceModifier.value).toBe(50);
    });
  });

  describe('Real-world modifier scenarios', () => {
    it('should handle frequency reduction modifier', () => {
      const sleepyModifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 1.1 // 10% slower (higher frequency = slower)
      };

      expect(sleepyModifier.path).toBe('frequency');
      expect(sleepyModifier.value).toBeGreaterThan(1);
    });

    it('should handle berry power boost modifier', () => {
      const berryBoost: PokemonModifier = {
        path: 'berry.power',
        operation: '+',
        value: 10
      };

      expect(berryBoost.path).toBe('berry.power');
      expect(berryBoost.value).toBe(10);
    });

    it('should handle level cap modifier', () => {
      const levelCap: PokemonInstanceModifier = {
        path: 'level',
        operation: '=',
        value: 60
      };

      expect(levelCap.path).toBe('level');
      expect(levelCap.operation).toBe('=');
      expect(levelCap.value).toBe(60);
    });

    it('should handle percentage modifiers', () => {
      const doubleIngredients: PokemonModifier = {
        path: 'ingredientPercentage',
        operation: '*',
        value: 2
      };

      const halfSkillChance: PokemonModifier = {
        path: 'skillPercentage',
        operation: '*',
        value: 0.5
      };

      expect(doubleIngredients.value).toBe(2);
      expect(halfSkillChance.value).toBe(0.5);
    });

    it('should handle array wildcard modifiers', () => {
      const doubleAllIngredients: PokemonModifier = {
        path: 'ingredient0.*.amount',
        operation: '*',
        value: 2
      };

      const boostAllSubskills: PokemonInstanceModifier = {
        path: 'subskills.*.level',
        operation: '+',
        value: 5
      };

      expect(doubleAllIngredients.path).toContain('*');
      expect(boostAllSubskills.path).toContain('*');
    });
  });

  describe('Modifier conditions', () => {
    it('should create modifiers with conditions', () => {
      const modifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9,
        condition: {
          path: 'specialty',
          operation: '=',
          value: 'berry'
        }
      };

      expect(modifier.condition).toBeDefined();
      expect(modifier.condition?.path).toBe('specialty');
      expect(modifier.condition?.operation).toBe('=');
      expect(modifier.condition?.value).toBe('berry');
    });

    it('should handle different condition operations', () => {
      const conditions: ModifierCondition[] = [
        { path: 'frequency', operation: '=', value: 2400 },
        { path: 'frequency', operation: '!=', value: 2400 },
        { path: 'frequency', operation: '>', value: 2400 },
        { path: 'frequency', operation: '<', value: 2400 },
        { path: 'frequency', operation: '>=', value: 2400 },
        { path: 'frequency', operation: '<=', value: 2400 },
        { path: 'specialty', operation: 'in', value: ['berry', 'skill'] },
        { path: 'specialty', operation: 'not-in', value: ['ingredient'] }
      ];

      expect(conditions).toHaveLength(8);
      expect(conditions[6].operation).toBe('in');
      expect(conditions[7].operation).toBe('not-in');
    });

    it('should enforce type-safe condition values', () => {
      // String value for string path
      const stringCondition: PokemonCondition = {
        path: 'specialty',
        operation: '=',
        value: 'berry'
      };

      // Number value for number path
      const numberCondition: PokemonCondition = {
        path: 'frequency',
        operation: '>',
        value: 2400
      };

      // Array values for 'in' operations
      const arrayCondition: PokemonCondition = {
        path: 'specialty',
        operation: 'in',
        value: ['berry', 'ingredient', 'skill']
      };

      expect(stringCondition.value).toBe('berry');
      expect(numberCondition.value).toBe(2400);
      expect(arrayCondition.value).toEqual(['berry', 'ingredient', 'skill']);
    });

    it('should work with mock factories', () => {
      const condition = mockModifierCondition();
      expect(condition.path).toBe('specialty');
      expect(condition.operation).toBe('=');
      expect(condition.value).toBe('berry');

      const customCondition = mockModifierCondition({
        path: 'level',
        operation: '>=',
        value: 50
      });
      expect(customCondition.path).toBe('level');
      expect(customCondition.operation).toBe('>=');
      expect(customCondition.value).toBe(50);
    });

    it('should create modifiers with conditions using mockModifierWithCondition', () => {
      const modifier = mockModifierWithCondition();
      expect(modifier.condition).toBeDefined();
      expect(modifier.condition?.path).toBe('specialty');
      expect(modifier.condition?.operation).toBe('=');
      expect(modifier.condition?.value).toBe('berry');
    });

    it('should handle complex conditions on nested paths', () => {
      const berryPowerCondition: PokemonCondition = {
        path: 'berry.power',
        operation: '>=',
        value: 30
      };

      const ingredientCondition: PokemonCondition = {
        path: 'ingredient0.*.amount',
        operation: '>',
        value: 2
      };

      expect(berryPowerCondition.path).toBe('berry.power');
      expect(ingredientCondition.path).toBe('ingredient0.*.amount');
    });

    it('should handle PokemonInstance conditions', () => {
      const levelCondition: PokemonInstanceCondition = {
        path: 'level',
        operation: '>=',
        value: 50
      };

      const ribbonCondition: PokemonInstanceCondition = {
        path: 'ribbon',
        operation: '>',
        value: 0
      };

      expect(levelCondition.path).toBe('level');
      expect(ribbonCondition.path).toBe('ribbon');
    });
  });

  describe('ConditionOperation', () => {
    it('should only allow valid condition operations', () => {
      const validOperations: ConditionOperation[] = ['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in'];
      expect(validOperations).toEqual(['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in']);

      type ExpectedOperations = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';
      expectTypeOf<ConditionOperation>().toEqualTypeOf<ExpectedOperations>();
    });
  });

  describe('Value type inference', () => {
    it('should enforce correct value types for Pokemon paths', () => {
      // String values for string paths
      const nameModifier: PokemonModifier = {
        path: 'name',
        operation: '=',
        value: 'Pikachu'
      };

      const displayNameModifier: PokemonModifier = {
        path: 'displayName',
        operation: '=',
        value: 'Electric Mouse'
      };

      expect(nameModifier.value).toBe('Pikachu');
      expect(displayNameModifier.value).toBe('Electric Mouse');
    });

    it('should enforce correct value types for specialty union type', () => {
      const specialtyModifier: PokemonModifier = {
        path: 'specialty',
        operation: '=',
        value: 'berry'
      };

      const anotherSpecialtyModifier: PokemonModifier = {
        path: 'specialty',
        operation: '=',
        value: 'ingredient'
      };

      expect(specialtyModifier.value).toBe('berry');
      expect(anotherSpecialtyModifier.value).toBe('ingredient');
    });

    it('should enforce correct value types for number paths', () => {
      const frequencyModifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9
      };

      const pokedexModifier: PokemonModifier = {
        path: 'pokedexNumber',
        operation: '=',
        value: 25
      };

      const carrySizeModifier: PokemonModifier = {
        path: 'carrySize',
        operation: '+',
        value: 5
      };

      expect(frequencyModifier.value).toBe(0.9);
      expect(pokedexModifier.value).toBe(25);
      expect(carrySizeModifier.value).toBe(5);
    });

    it('should enforce correct value types for nested object paths', () => {
      const berryNameModifier: PokemonModifier = {
        path: 'berry.name',
        operation: '=',
        value: 'Oran Berry'
      };

      const berryPowerModifier: PokemonModifier = {
        path: 'berry.power',
        operation: '+',
        value: 10
      };

      const skillNameModifier: PokemonModifier = {
        path: 'skill.name',
        operation: '=',
        value: 'Charge Energy S'
      };

      expect(berryNameModifier.value).toBe('Oran Berry');
      expect(berryPowerModifier.value).toBe(10);
      expect(skillNameModifier.value).toBe('Charge Energy S');
    });

    it('should enforce correct value types for array element paths', () => {
      const ingredientAmountModifier: PokemonModifier = {
        path: 'ingredient0.0.amount',
        operation: '*',
        value: 2
      };

      const wildcardIngredientModifier: PokemonModifier = {
        path: 'ingredient30.*.amount',
        operation: '+',
        value: 1
      };

      expect(ingredientAmountModifier.value).toBe(2);
      expect(wildcardIngredientModifier.value).toBe(1);
    });

    it('should enforce correct value types for PokemonInstance paths', () => {
      const levelModifier: PokemonInstanceModifier = {
        path: 'level',
        operation: '=',
        value: 50
      };

      const ribbonModifier: PokemonInstanceModifier = {
        path: 'ribbon',
        operation: '+',
        value: 1
      };

      const skillLevelModifier: PokemonInstanceModifier = {
        path: 'skillLevel',
        operation: '=',
        value: 6
      };

      expect(levelModifier.value).toBe(50);
      expect(ribbonModifier.value).toBe(1);
      expect(skillLevelModifier.value).toBe(6);
    });

    it('should enforce correct value types for PokemonInstance nested paths', () => {
      const subskillIdModifier: PokemonInstanceModifier = {
        path: 'subskills.0.id',
        operation: '=',
        value: 'helping_speed_m'
      };

      const ingredientIdModifier: PokemonInstanceModifier = {
        path: 'ingredients.*.id',
        operation: '=',
        value: 'fancy_apple'
      };

      const ingredientAmountModifier: PokemonInstanceModifier = {
        path: 'ingredients.0.amount',
        operation: '*',
        value: 1.5
      };

      expect(subskillIdModifier.value).toBe('helping_speed_m');
      expect(ingredientIdModifier.value).toBe('fancy_apple');
      expect(ingredientAmountModifier.value).toBe(1.5);
    });
  });

  describe('Condition value type inference', () => {
    it('should enforce correct condition value types for string paths', () => {
      const stringCondition: PokemonCondition = {
        path: 'name',
        operation: '=',
        value: 'Pikachu'
      };

      const arrayStringCondition: PokemonCondition = {
        path: 'specialty',
        operation: 'in',
        value: ['berry', 'ingredient']
      };

      expect(stringCondition.value).toBe('Pikachu');
      expect(arrayStringCondition.value).toEqual(['berry', 'ingredient']);
    });

    it('should enforce correct condition value types for number paths', () => {
      const numberCondition: PokemonCondition = {
        path: 'frequency',
        operation: '>=',
        value: 2400
      };

      const arrayNumberCondition: PokemonCondition = {
        path: 'carrySize',
        operation: 'in',
        value: [10, 15, 20]
      };

      expect(numberCondition.value).toBe(2400);
      expect(arrayNumberCondition.value).toEqual([10, 15, 20]);
    });

    it('should enforce correct condition value types for nested paths', () => {
      const nestedStringCondition: PokemonCondition = {
        path: 'berry.name',
        operation: '!=',
        value: 'Unknown Berry'
      };

      const nestedNumberCondition: PokemonCondition = {
        path: 'berry.power',
        operation: '>',
        value: 25
      };

      expect(nestedStringCondition.value).toBe('Unknown Berry');
      expect(nestedNumberCondition.value).toBe(25);
    });

    it('should handle PokemonInstance condition value types', () => {
      const levelCondition: PokemonInstanceCondition = {
        path: 'level',
        operation: '>=',
        value: 30
      };

      const subskillCondition: PokemonInstanceCondition = {
        path: 'subskills.*.id',
        operation: 'in',
        value: ['helping_speed_m', 'berry_finding_s']
      };

      expect(levelCondition.value).toBe(30);
      expect(subskillCondition.value).toEqual(['helping_speed_m', 'berry_finding_s']);
    });
  });

  describe('Complex modifier scenarios with type safety', () => {
    it('should create modifiers with matching path and condition types', () => {
      const modifier: PokemonModifier = {
        path: 'berry.power',
        operation: '+',
        value: 5, // number for berry.power
        condition: {
          path: 'specialty',
          operation: '=',
          value: 'berry' // string for specialty
        }
      };

      expect(modifier.value).toBe(5);
      expect(modifier.condition?.value).toBe('berry');
    });

    it('should handle array-based conditions', () => {
      const modifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.8,
        condition: {
          path: 'specialty',
          operation: 'in',
          value: ['berry', 'skill'] // array of strings
        }
      };

      expect(modifier.value).toBe(0.8);
      expect(modifier.condition?.value).toEqual(['berry', 'skill']);
    });

    it('should handle numeric array conditions', () => {
      const modifier: PokemonModifier = {
        path: 'skillPercentage',
        operation: '+',
        value: 0.1,
        condition: {
          path: 'carrySize',
          operation: 'in',
          value: [15, 20, 25] // array of numbers
        }
      };

      expect(modifier.value).toBe(0.1);
      expect(modifier.condition?.value).toEqual([15, 20, 25]);
    });

    it('should handle wildcard array path conditions', () => {
      const modifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9,
        condition: {
          path: 'ingredient0.*.amount',
          operation: '>',
          value: 2 // number for ingredient amount
        }
      };

      expect(modifier.value).toBe(0.9);
      expect(modifier.condition?.value).toBe(2);
    });
  });

  describe('Mock factory type safety', () => {
    it('should create type-safe modifiers with mock factories', () => {
      const pokemonModifier = mockModifier<'Pokemon'>({
        path: 'berry.power',
        value: 15
      });

      const instanceModifier = mockModifier<'PokemonInstance'>({
        path: 'level',
        value: 45
      });

      expect(pokemonModifier.path).toBe('berry.power');
      expect(pokemonModifier.value).toBe(15);
      expect(instanceModifier.path).toBe('level');
      expect(instanceModifier.value).toBe(45);
    });

    it('should create type-safe conditions with mock factories', () => {
      const stringCondition = mockModifierCondition<'Pokemon'>({
        path: 'specialty',
        operation: '=',
        value: 'ingredient'
      });

      const numberCondition = mockModifierCondition<'PokemonInstance'>({
        path: 'level',
        operation: '>=',
        value: 30
      });

      expect(stringCondition.value).toBe('ingredient');
      expect(numberCondition.value).toBe(30);
    });
  });

  describe('Generic modifier usage type safety', () => {
    it('should allow various value types when using generic Modifier', () => {
      // When using generic Modifier (without specific type), should accept various types
      const numberModifier: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9
      };

      const stringModifier: Modifier = {
        path: 'displayName',
        operation: '=',
        value: 'Pikachu'
      };

      const unionModifier: Modifier = {
        path: 'specialty',
        operation: '=',
        value: 'berry'
      };

      const nestedStringModifier: Modifier = {
        path: 'berry.name',
        operation: '=',
        value: 'Oran Berry'
      };

      const nestedNumberModifier: Modifier = {
        path: 'berry.power',
        operation: '+',
        value: 10
      };

      expect(numberModifier.value).toBe(0.9);
      expect(stringModifier.value).toBe('Pikachu');
      expect(unionModifier.value).toBe('berry');
      expect(nestedStringModifier.value).toBe('Oran Berry');
      expect(nestedNumberModifier.value).toBe(10);
    });

    it('should allow various condition value types when using generic Modifier', () => {
      const modifierWithStringCondition: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9,
        condition: {
          path: 'specialty',
          operation: '=',
          value: 'berry'
        }
      };

      const modifierWithNumberCondition: Modifier = {
        path: 'skillPercentage',
        operation: '+',
        value: 0.1,
        condition: {
          path: 'frequency',
          operation: '>=',
          value: 2400
        }
      };

      const modifierWithArrayCondition: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.8,
        condition: {
          path: 'specialty',
          operation: 'in',
          value: ['berry', 'skill']
        }
      };

      expect(modifierWithStringCondition.condition?.value).toBe('berry');
      expect(modifierWithNumberCondition.condition?.value).toBe(2400);
      expect(modifierWithArrayCondition.condition?.value).toEqual(['berry', 'skill']);
    });

    it('should work with mock factories using generic types', () => {
      const genericModifier = mockModifier({
        path: 'displayName',
        value: 'Test Pokemon'
      });

      const genericCondition = mockModifierCondition({
        path: 'berry.name',
        value: 'Test Berry'
      });

      expect(genericModifier.value).toBe('Test Pokemon');
      expect(genericCondition.value).toBe('Test Berry');
    });

    it('should handle PokemonInstance paths with generic usage', () => {
      const instanceModifier: Modifier = {
        path: 'level',
        operation: '=',
        value: 50
      };

      const instanceStringModifier: Modifier = {
        path: 'pokemon',
        operation: '=',
        value: 'pikachu'
      };

      const nestedInstanceModifier: Modifier = {
        path: 'ingredients.0.id',
        operation: '=',
        value: 'fancy_apple'
      };

      expect(instanceModifier.value).toBe(50);
      expect(instanceStringModifier.value).toBe('pikachu');
      expect(nestedInstanceModifier.value).toBe('fancy_apple');
    });
  });

  describe('Type inference edge cases', () => {
    it('should handle invalid paths gracefully in generic usage', () => {
      // These should compile (unknown type) but we test they work at runtime
      const invalidPathModifier: Modifier = {
        path: 'nonExistentPath' as string,
        operation: '=',
        value: 'any value'
      };

      expect(invalidPathModifier.value).toBe('any value');
    });

    it('should handle mixed Pokemon/PokemonInstance paths in generic usage', () => {
      // These paths exist on different types but should work with generic Modifier
      const pokemonPath: Modifier = {
        path: 'berry.power', // Pokemon specific
        operation: '+',
        value: 5
      };

      const instancePath: Modifier = {
        path: 'level', // PokemonInstance specific
        operation: '=',
        value: 30
      };

      expect(pokemonPath.value).toBe(5);
      expect(instancePath.value).toBe(30);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for Pokemon paths', () => {
      const validModifier: PokemonModifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9
      };

      // TypeScript would prevent these at compile time:
      // const invalidModifier: PokemonModifier = {
      //   path: 'invalidPath', // Error: not a valid Pokemon path
      //   operation: '*',
      //   value: 0.9
      // };

      expect(validModifier.path).toBe('frequency');
    });

    it('should maintain type safety for PokemonInstance paths', () => {
      const validModifier: PokemonInstanceModifier = {
        path: 'level',
        operation: '+',
        value: 1
      };

      // TypeScript would prevent these at compile time:
      // const invalidModifier: PokemonInstanceModifier = {
      //   path: 'berry.power', // Error: berry.power is on Pokemon, not PokemonInstance
      //   operation: '+',
      //   value: 1
      // };

      expect(validModifier.path).toBe('level');
    });

    it('should maintain type safety for operations', () => {
      const validModifier: Modifier = {
        path: 'frequency',
        operation: '*',
        value: 0.9
      };

      // TypeScript would prevent these at compile time:
      // const invalidModifier: Modifier = {
      //   path: 'frequency',
      //   operation: 'invalid', // Error: not a valid operation
      //   value: 0.9
      // };

      expect(validModifier.operation).toBe('*');
    });
  });
});
