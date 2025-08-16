import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Pokemon } from '../pokemon';
import type { PokemonInstance } from '../instance';
import type { ModifierTargetTypeDTO, ModifierTargetType, TargetTypeMap, TypedPath } from './target-types';

describe('Target Types', () => {
  describe('ModifierTargetTypeDTO', () => {
    it('should only allow Pokemon or PokemonInstance as string literals', () => {
      const validTargets: ModifierTargetTypeDTO[] = ['Pokemon', 'PokemonInstance'];
      expect(validTargets).toEqual(['Pokemon', 'PokemonInstance']);

      // Type check that these are the only valid values
      type ExpectedDTO = 'Pokemon' | 'PokemonInstance';
      expectTypeOf<ModifierTargetTypeDTO>().toEqualTypeOf<ExpectedDTO>();
    });
  });

  describe('ModifierTargetType', () => {
    it('should be a union of Pokemon and PokemonInstance types', () => {
      type ExpectedUnion = Pokemon | PokemonInstance;
      expectTypeOf<ModifierTargetType>().toEqualTypeOf<ExpectedUnion>();
    });
  });

  describe('TargetTypeMap', () => {
    it('should correctly map string keys to their types', () => {
      type PokemonMapping = TargetTypeMap['Pokemon'];
      type InstanceMapping = TargetTypeMap['PokemonInstance'];

      expectTypeOf<PokemonMapping>().toEqualTypeOf<Pokemon>();
      expectTypeOf<InstanceMapping>().toEqualTypeOf<PokemonInstance>();
    });

    it('should have exactly two keys', () => {
      type Keys = keyof TargetTypeMap;
      type ExpectedKeys = 'Pokemon' | 'PokemonInstance';

      expectTypeOf<Keys>().toEqualTypeOf<ExpectedKeys>();
    });
  });

  describe('TypedPath', () => {
    it('should generate paths for Pokemon type', () => {
      type PokemonPaths = TypedPath<'Pokemon'>;

      // These should be valid Pokemon paths
      const validPokemonPaths: PokemonPaths[] = [
        'name',
        'displayName',
        'pokedexNumber',
        'specialty',
        'frequency',
        'ingredientPercentage',
        'skillPercentage',
        'berry',
        'berry.name',
        'berry.power',
        'carrySize',
        'previousEvolutions',
        'remainingEvolutions',
        'ingredient0',
        'ingredient0.0',
        'ingredient0.0.amount',
        'ingredient0.*.amount',
        'ingredient30',
        'ingredient30.*.amount',
        'ingredient60',
        'ingredient60.*.amount',
        'skill',
        'skill.name'
      ];

      expect(validPokemonPaths).toContain('frequency');
      expect(validPokemonPaths).toContain('berry.name');
      expect(validPokemonPaths).toContain('ingredient0.*.amount');
    });

    it('should generate paths for PokemonInstance type', () => {
      type InstancePaths = TypedPath<'PokemonInstance'>;

      // These should be valid PokemonInstance paths
      const validInstancePaths: InstancePaths[] = [
        'pokemon',
        'level',
        'ribbon',
        'carrySize',
        'skillLevel',
        'nature',
        'subskills',
        'subskills.0',
        'subskills.0.id',
        'subskills.0.level',
        'subskills.*.id',
        'subskills.*.level',
        'ingredients',
        'ingredients.0',
        'ingredients.0.id',
        'ingredients.0.amount',
        'ingredients.*.id',
        'ingredients.*.amount'
      ];

      expect(validInstancePaths).toContain('level');
      expect(validInstancePaths).toContain('nature');
      expect(validInstancePaths).toContain('subskills.*.id');
      expect(validInstancePaths).toContain('ingredients.*.amount');
    });

    it('should handle nested paths correctly', () => {
      // Test that nested paths work for complex structures
      type PokemonPaths = TypedPath<'Pokemon'>;

      // Berry nested paths
      const berryPath: PokemonPaths = 'berry';
      const berryNamePath: PokemonPaths = 'berry.name';

      expect(berryPath).toBe('berry');
      expect(berryNamePath).toBe('berry.name');

      // Array paths with wildcards
      const ingredientPath: PokemonPaths = 'ingredient0';
      const ingredientWildcardPath: PokemonPaths = 'ingredient0.*.amount';
      const ingredientIndexPath: PokemonPaths = 'ingredient0.0.amount';

      expect(ingredientPath).toBe('ingredient0');
      expect(ingredientWildcardPath).toBe('ingredient0.*.amount');
      expect(ingredientIndexPath).toBe('ingredient0.0.amount');
    });

    it('should handle array index and wildcard notation', () => {
      type InstancePaths = TypedPath<'PokemonInstance'>;

      // Test numeric index notation
      const indexPath: InstancePaths = 'subskills.0';
      const indexNestedPath: InstancePaths = 'subskills.0.id';

      expect(indexPath).toBe('subskills.0');
      expect(indexNestedPath).toBe('subskills.0.id');

      // Test wildcard notation
      const wildcardPath: InstancePaths = 'subskills.*';
      const wildcardNestedPath: InstancePaths = 'subskills.*.id';

      expect(wildcardPath).toBe('subskills.*');
      expect(wildcardNestedPath).toBe('subskills.*.id');
    });

    it('should provide type safety for paths', () => {
      type PokemonPaths = TypedPath<'Pokemon'>;
      type InstancePaths = TypedPath<'PokemonInstance'>;

      // These should be assignable
      const pokemonPath: PokemonPaths = 'frequency';
      const instancePath: InstancePaths = 'level';

      expect(pokemonPath).toBe('frequency');
      expect(instancePath).toBe('level');

      // TypeScript should prevent invalid paths at compile time
      // The following would cause compile errors if uncommented:
      // const invalidPokemonPath: PokemonPaths = 'invalidPath';
      // const wrongTypePath: PokemonPaths = 'level'; // level is on PokemonInstance, not Pokemon
    });
  });

  describe('Type mapping consistency', () => {
    it('should maintain consistency between DTO strings and mapped types', () => {
      // Verify that each DTO string maps to the correct type
      type PokemonFromMap = TargetTypeMap['Pokemon'];
      type InstanceFromMap = TargetTypeMap['PokemonInstance'];

      expectTypeOf<PokemonFromMap>().toEqualTypeOf<Pokemon>();
      expectTypeOf<InstanceFromMap>().toEqualTypeOf<PokemonInstance>();

      // Verify that the keys of TargetTypeMap match ModifierTargetTypeDTO
      type MapKeys = keyof TargetTypeMap;
      expectTypeOf<MapKeys>().toEqualTypeOf<ModifierTargetTypeDTO>();
    });

    it('should correctly derive paths based on the DTO type parameter', () => {
      // Test that TypedPath correctly uses the TargetTypeMap
      type TestPokemonPaths = TypedPath<'Pokemon'>;
      type TestInstancePaths = TypedPath<'PokemonInstance'>;

      // These paths should be mutually exclusive
      const pokemonOnlyPath: TestPokemonPaths = 'berry';
      const instanceOnlyPath: TestInstancePaths = 'level';

      expect(pokemonOnlyPath).toBe('berry');
      expect(instanceOnlyPath).toBe('level');
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should support common modifier paths for Pokemon', () => {
      type PokemonPaths = TypedPath<'Pokemon'>;

      const commonModifierPaths: PokemonPaths[] = [
        'frequency', // Modify helping frequency
        'skillPercentage', // Modify skill trigger chance
        'ingredientPercentage', // Modify ingredient finding rate
        'carrySize', // Modify carry capacity
        'berry.power' // Modify berry power
      ];

      expect(commonModifierPaths).toHaveLength(5);
      commonModifierPaths.forEach((path) => {
        expect(typeof path).toBe('string');
      });
    });

    it('should support common modifier paths for PokemonInstance', () => {
      type InstancePaths = TypedPath<'PokemonInstance'>;

      const commonModifierPaths: InstancePaths[] = [
        'level', // Modify level
        'carrySize', // Modify carry capacity
        'skillLevel', // Modify skill level
        'ribbon', // Modify ribbon count
        'subskills.*.level' // Modify subskill levels
      ];

      expect(commonModifierPaths).toHaveLength(5);
      commonModifierPaths.forEach((path) => {
        expect(typeof path).toBe('string');
      });
    });
  });
});
