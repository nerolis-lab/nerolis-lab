import { describe, expect, it } from 'vitest';
import type { PathKeys } from './type-paths';

describe('PathKeys', () => {
  describe('Simple object paths', () => {
    it('should extract paths from flat objects', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      const valid1: PathKeys<FlatObject> = 'name';
      const valid2: PathKeys<FlatObject> = 'age';
      const valid3: PathKeys<FlatObject> = 'active';

      expect(valid1).toBe('name');
      expect(valid2).toBe('age');
      expect(valid3).toBe('active');
    });

    it('should reject invalid paths', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      // @ts-expect-error - invalid path
      const invalid1: PathKeys<FlatObject> = 'invalid';

      expect(invalid1).toBe('invalid');
    });
  });

  describe('Nested object paths', () => {
    it('should extract nested paths from objects', () => {
      interface NestedObject {
        user: {
          name: string;
          profile: {
            age: number;
            city: string;
          };
        };
      }

      const valid1: PathKeys<NestedObject> = 'user';
      const valid2: PathKeys<NestedObject> = 'user.name';
      const valid3: PathKeys<NestedObject> = 'user.profile';
      const valid4: PathKeys<NestedObject> = 'user.profile.age';
      const valid5: PathKeys<NestedObject> = 'user.profile.city';

      expect(valid1).toBe('user');
      expect(valid2).toBe('user.name');
      expect(valid3).toBe('user.profile');
      expect(valid4).toBe('user.profile.age');
      expect(valid5).toBe('user.profile.city');
    });

    it('should reject invalid nested paths', () => {
      interface NestedObject {
        user: {
          name: string;
        };
      }

      // @ts-expect-error - invalid path
      const invalid1: PathKeys<NestedObject> = 'user.invalid';

      expect(invalid1).toBe('user.invalid');
    });

    it('should handle deeply nested structures', () => {
      interface DeepObject {
        level1: {
          level2: {
            level3: {
              value: string;
            };
          };
        };
      }

      const valid1: PathKeys<DeepObject> = 'level1';
      const valid2: PathKeys<DeepObject> = 'level1.level2';
      const valid3: PathKeys<DeepObject> = 'level1.level2.level3';
      const valid4: PathKeys<DeepObject> = 'level1.level2.level3.value';

      expect(valid1).toBe('level1');
      expect(valid2).toBe('level1.level2');
      expect(valid3).toBe('level1.level2.level3');
      expect(valid4).toBe('level1.level2.level3.value');
    });
  });

  describe('Array paths', () => {
    it('should handle arrays of primitives', () => {
      interface ArrayObject {
        numbers: number[];
        strings: string[];
      }

      const valid1: PathKeys<ArrayObject> = 'numbers';
      const valid2: PathKeys<ArrayObject> = 'numbers.0';
      const valid3: PathKeys<ArrayObject> = 'numbers.*';
      const valid4: PathKeys<ArrayObject> = 'strings';
      const valid5: PathKeys<ArrayObject> = 'strings.1';
      const valid6: PathKeys<ArrayObject> = 'strings.*';

      expect(valid1).toBe('numbers');
      expect(valid2).toBe('numbers.0');
      expect(valid3).toBe('numbers.*');
      expect(valid4).toBe('strings');
      expect(valid5).toBe('strings.1');
      expect(valid6).toBe('strings.*');
    });

    it('should handle arrays of objects', () => {
      interface ArrayOfObjects {
        items: {
          id: number;
          name: string;
          details: {
            description: string;
          };
        }[];
      }

      const valid1: PathKeys<ArrayOfObjects> = 'items';
      const valid2: PathKeys<ArrayOfObjects> = 'items.0';
      const valid3: PathKeys<ArrayOfObjects> = 'items.0.id';
      const valid4: PathKeys<ArrayOfObjects> = 'items.0.name';
      const valid5: PathKeys<ArrayOfObjects> = 'items.0.details';
      const valid6: PathKeys<ArrayOfObjects> = 'items.0.details.description';
      const valid7: PathKeys<ArrayOfObjects> = 'items.*';
      const valid8: PathKeys<ArrayOfObjects> = 'items.*.id';
      const valid9: PathKeys<ArrayOfObjects> = 'items.*.name';
      const valid10: PathKeys<ArrayOfObjects> = 'items.*.details';
      const valid11: PathKeys<ArrayOfObjects> = 'items.*.details.description';

      expect(valid1).toBe('items');
      expect(valid2).toBe('items.0');
      expect(valid3).toBe('items.0.id');
      expect(valid4).toBe('items.0.name');
      expect(valid5).toBe('items.0.details');
      expect(valid6).toBe('items.0.details.description');
      expect(valid7).toBe('items.*');
      expect(valid8).toBe('items.*.id');
      expect(valid9).toBe('items.*.name');
      expect(valid10).toBe('items.*.details');
      expect(valid11).toBe('items.*.details.description');
    });
  });

  describe('Complex real-world types', () => {
    it('should handle Pokemon-like structures', () => {
      interface SimplePokemon {
        name: string;
        frequency: number;
        berry: {
          name: string;
          power: number;
        };
        ingredients: {
          amount: number;
          type: string;
        }[];
      }

      const valid1: PathKeys<SimplePokemon> = 'name';
      const valid2: PathKeys<SimplePokemon> = 'frequency';
      const valid3: PathKeys<SimplePokemon> = 'berry';
      const valid4: PathKeys<SimplePokemon> = 'berry.name';
      const valid5: PathKeys<SimplePokemon> = 'berry.power';
      const valid6: PathKeys<SimplePokemon> = 'ingredients';
      const valid7: PathKeys<SimplePokemon> = 'ingredients.0';
      const valid8: PathKeys<SimplePokemon> = 'ingredients.0.amount';
      const valid9: PathKeys<SimplePokemon> = 'ingredients.0.type';
      const valid10: PathKeys<SimplePokemon> = 'ingredients.*.amount';
      const valid11: PathKeys<SimplePokemon> = 'ingredients.*.type';

      expect(valid1).toBe('name');
      expect(valid2).toBe('frequency');
      expect(valid3).toBe('berry');
      expect(valid4).toBe('berry.name');
      expect(valid5).toBe('berry.power');
      expect(valid6).toBe('ingredients');
      expect(valid7).toBe('ingredients.0');
      expect(valid8).toBe('ingredients.0.amount');
      expect(valid9).toBe('ingredients.0.type');
      expect(valid10).toBe('ingredients.*.amount');
      expect(valid11).toBe('ingredients.*.type');
    });

    it('should handle mixed nested structures', () => {
      interface MixedStructure {
        id: number;
        data: {
          users: {
            name: string;
            roles: string[];
            settings: {
              theme: string;
              notifications: boolean;
            };
          }[];
          metadata: {
            created: Date;
            updated: Date;
          };
        };
      }

      const valid1: PathKeys<MixedStructure> = 'id';
      const valid2: PathKeys<MixedStructure> = 'data';
      const valid3: PathKeys<MixedStructure> = 'data.users';
      const valid4: PathKeys<MixedStructure> = 'data.users.0';
      const valid5: PathKeys<MixedStructure> = 'data.users.0.name';
      const valid6: PathKeys<MixedStructure> = 'data.users.0.roles';
      const valid7: PathKeys<MixedStructure> = 'data.users.0.roles.0';
      const valid8: PathKeys<MixedStructure> = 'data.users.0.roles.*';
      const valid9: PathKeys<MixedStructure> = 'data.users.0.settings';
      const valid10: PathKeys<MixedStructure> = 'data.users.0.settings.theme';
      const valid11: PathKeys<MixedStructure> = 'data.users.0.settings.notifications';
      const valid12: PathKeys<MixedStructure> = 'data.users.*.name';
      const valid13: PathKeys<MixedStructure> = 'data.users.*.roles';
      const valid14: PathKeys<MixedStructure> = 'data.users.*.roles.0';
      const valid15: PathKeys<MixedStructure> = 'data.users.*.roles.*';
      const valid16: PathKeys<MixedStructure> = 'data.users.*.settings';
      const valid17: PathKeys<MixedStructure> = 'data.users.*.settings.theme';
      const valid18: PathKeys<MixedStructure> = 'data.users.*.settings.notifications';
      const valid19: PathKeys<MixedStructure> = 'data.metadata';
      const valid20: PathKeys<MixedStructure> = 'data.metadata.created';
      const valid21: PathKeys<MixedStructure> = 'data.metadata.updated';

      expect(valid1).toBe('id');
      expect(valid2).toBe('data');
      expect(valid3).toBe('data.users');
      expect(valid4).toBe('data.users.0');
      expect(valid5).toBe('data.users.0.name');
      expect(valid6).toBe('data.users.0.roles');
      expect(valid7).toBe('data.users.0.roles.0');
      expect(valid8).toBe('data.users.0.roles.*');
      expect(valid9).toBe('data.users.0.settings');
      expect(valid10).toBe('data.users.0.settings.theme');
      expect(valid11).toBe('data.users.0.settings.notifications');
      expect(valid12).toBe('data.users.*.name');
      expect(valid13).toBe('data.users.*.roles');
      expect(valid14).toBe('data.users.*.roles.0');
      expect(valid15).toBe('data.users.*.roles.*');
      expect(valid16).toBe('data.users.*.settings');
      expect(valid17).toBe('data.users.*.settings.theme');
      expect(valid18).toBe('data.users.*.settings.notifications');
      expect(valid19).toBe('data.metadata');
      expect(valid20).toBe('data.metadata.created');
      expect(valid21).toBe('data.metadata.updated');
    });
  });

  describe('Edge cases', () => {
    it('should handle optional properties', () => {
      interface OptionalProps {
        required: string;
        optional?: number;
        nested?: {
          value: string;
        };
      }

      const valid1: PathKeys<OptionalProps> = 'required';
      const valid2: PathKeys<OptionalProps> = 'optional';
      const valid3: PathKeys<OptionalProps> = 'nested';
      const valid4: PathKeys<OptionalProps> = 'nested.value';

      expect(valid1).toBe('required');
      expect(valid2).toBe('optional');
      expect(valid3).toBe('nested');
      expect(valid4).toBe('nested.value');
    });

    it('should handle union types in properties', () => {
      interface UnionProps {
        value: string | number;
        object: { id: number } | { name: string };
      }

      const valid1: PathKeys<UnionProps> = 'value';
      const valid2: PathKeys<UnionProps> = 'object';

      // @ts-expect-error - Union types don't expose nested paths
      const invalid1: PathKeys<UnionProps> = 'object.id';
      // @ts-expect-error - Union types don't expose nested paths
      const invalid2: PathKeys<UnionProps> = 'object.name';

      expect(valid1).toBe('value');
      expect(valid2).toBe('object');
      expect(invalid1).toBe('object.id');
      expect(invalid2).toBe('object.name');
    });

    it('should handle tuples', () => {
      interface TupleObject {
        tuple: [string, number, { value: boolean }];
      }

      const valid1: PathKeys<TupleObject> = 'tuple';
      const valid2: PathKeys<TupleObject> = 'tuple.0';
      const valid3: PathKeys<TupleObject> = 'tuple.1';
      const valid4: PathKeys<TupleObject> = 'tuple.2';
      const valid5: PathKeys<TupleObject> = 'tuple.2.value';
      const valid6: PathKeys<TupleObject> = 'tuple.*.value';

      expect(valid1).toBe('tuple');
      expect(valid2).toBe('tuple.0');
      expect(valid3).toBe('tuple.1');
      expect(valid4).toBe('tuple.2');
      expect(valid5).toBe('tuple.2.value');
      expect(valid6).toBe('tuple.*.value');
    });
  });

  describe('Type inference verification', () => {
    it('should correctly infer paths for real modifier target types', () => {
      // Simplified Pokemon type for testing
      interface TestPokemon {
        name: string;
        frequency: number;
        specialty: 'berry' | 'ingredient' | 'skill';
        berry: {
          name: string;
          power: number;
        };
        ingredient0: { amount: number }[];
        ingredient30: { amount: number }[];
        ingredient60: { amount: number }[];
      }

      const pathExamples: PathKeys<TestPokemon>[] = [
        'name',
        'frequency',
        'specialty',
        'berry',
        'berry.name',
        'berry.power',
        'ingredient0',
        'ingredient0.0',
        'ingredient0.0.amount',
        'ingredient0.*.amount',
        'ingredient30',
        'ingredient30.*.amount',
        'ingredient60',
        'ingredient60.*.amount'
      ];

      expect(pathExamples).toContain('frequency');
      expect(pathExamples).toContain('berry.power');
      expect(pathExamples).toContain('ingredient0.*.amount');
    });

    it('should correctly infer paths for PokemonInstance-like types', () => {
      interface TestPokemonInstance {
        id: string;
        pokemon: {
          name: string;
          frequency: number;
        };
        level: number;
        nature: {
          name: string;
          modifiers: {
            frequency: number;
            energy: number;
          };
        };
        subskills: {
          name: string;
          value: number;
        }[];
      }

      type InstancePaths = PathKeys<TestPokemonInstance>;

      const pathExamples: InstancePaths[] = [
        'id',
        'pokemon',
        'pokemon.name',
        'pokemon.frequency',
        'level',
        'nature',
        'nature.name',
        'nature.modifiers',
        'nature.modifiers.frequency',
        'nature.modifiers.energy',
        'subskills',
        'subskills.0',
        'subskills.0.name',
        'subskills.0.value',
        'subskills.*.name',
        'subskills.*.value'
      ];

      expect(pathExamples).toContain('pokemon.frequency');
      expect(pathExamples).toContain('nature.modifiers.frequency');
      expect(pathExamples).toContain('subskills.*.value');
    });
  });
});
