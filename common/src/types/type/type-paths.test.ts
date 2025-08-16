import { describe, expect, expectTypeOf, it } from 'vitest';
import type { PathKeys } from './type-paths';

describe('PathKeys type utility', () => {
  describe('Simple object paths', () => {
    it('should extract paths from flat objects', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      type Paths = PathKeys<FlatObject>;
      type Expected = 'name' | 'age' | 'active';

      const validPaths: Paths[] = ['name', 'age', 'active'];
      expect(validPaths).toEqual(['name', 'age', 'active']);

      expectTypeOf<Paths>().toEqualTypeOf<Expected>();
    });

    it('should handle empty objects', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface EmptyObject {}

      type Paths = PathKeys<EmptyObject>;
      type Expected = never;

      expectTypeOf<Paths>().toEqualTypeOf<Expected>();
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

      type Paths = PathKeys<NestedObject>;

      const validPaths: Paths[] = ['user', 'user.name', 'user.profile', 'user.profile.age', 'user.profile.city'];

      expect(validPaths).toHaveLength(5);
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

      type Paths = PathKeys<DeepObject>;

      const validPaths: Paths[] = ['level1', 'level1.level2', 'level1.level2.level3', 'level1.level2.level3.value'];

      expect(validPaths).toHaveLength(4);
    });
  });

  describe('Array paths', () => {
    it('should handle arrays of primitives', () => {
      interface ArrayObject {
        numbers: number[];
        strings: string[];
      }

      type Paths = PathKeys<ArrayObject>;

      const validPaths: Paths[] = ['numbers', 'numbers.0', 'numbers.*', 'strings', 'strings.1', 'strings.*'];

      expect(validPaths).toContain('numbers');
      expect(validPaths).toContain('numbers.0');
      expect(validPaths).toContain('numbers.*');
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

      type Paths = PathKeys<ArrayOfObjects>;

      const validPaths: Paths[] = [
        'items',
        'items.0',
        'items.0.id',
        'items.0.name',
        'items.0.details',
        'items.0.details.description',
        'items.*.id',
        'items.*.name',
        'items.*.details',
        'items.*.details.description'
      ];

      expect(validPaths).toContain('items.0.details.description');
      expect(validPaths).toContain('items.*.details.description');
    });

    it('should handle readonly arrays', () => {
      interface ReadonlyArrayObject {
        readonly items: readonly string[];
        readonly objects: readonly { value: number }[];
      }

      type Paths = PathKeys<ReadonlyArrayObject>;

      const validPaths: Paths[] = [
        'items',
        'items.0',
        'items.*',
        'objects',
        'objects.0',
        'objects.0.value',
        'objects.*.value'
      ];

      expect(validPaths).toHaveLength(7);
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

      type Paths = PathKeys<SimplePokemon>;

      const validPaths: Paths[] = [
        'name',
        'frequency',
        'berry',
        'berry.name',
        'berry.power',
        'ingredients',
        'ingredients.0',
        'ingredients.0.amount',
        'ingredients.0.type',
        'ingredients.*.amount',
        'ingredients.*.type'
      ];

      expect(validPaths).toContain('berry.name');
      expect(validPaths).toContain('ingredients.*.amount');
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

      type Paths = PathKeys<MixedStructure>;

      const validPaths: Paths[] = [
        'id',
        'data',
        'data.users',
        'data.users.0',
        'data.users.0.name',
        'data.users.0.roles',
        'data.users.0.roles.0',
        'data.users.0.roles.*',
        'data.users.0.settings',
        'data.users.0.settings.theme',
        'data.users.0.settings.notifications',
        'data.users.*.name',
        'data.users.*.roles',
        'data.users.*.roles.0',
        'data.users.*.roles.*',
        'data.users.*.settings',
        'data.users.*.settings.theme',
        'data.users.*.settings.notifications',
        'data.metadata',
        'data.metadata.created',
        'data.metadata.updated'
      ];

      expect(validPaths).toContain('data.users.*.settings.theme');
      expect(validPaths).toContain('data.users.0.roles.*');
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

      type Paths = PathKeys<OptionalProps>;

      const validPaths: Paths[] = ['required', 'optional', 'nested', 'nested.value'];

      expect(validPaths).toHaveLength(4);
    });

    it('should handle union types in properties', () => {
      interface UnionProps {
        value: string | number;
        object: { id: number } | { name: string };
      }

      type Paths = PathKeys<UnionProps>;

      const validPaths: Paths[] = ['value', 'object'];

      // Union types don't expose nested paths
      expect(validPaths).toHaveLength(2);
    });

    it('should handle recursive types', () => {
      interface TreeNode {
        value: string;
        children: TreeNode[];
      }

      type Paths = PathKeys<TreeNode>;

      const validPaths: Paths[] = [
        'value',
        'children',
        'children.0',
        'children.0.value',
        'children.0.children',
        'children.*.value',
        'children.*.children'
      ];

      expect(validPaths).toContain('children.*.value');
    });

    it('should not extract paths from non-object types', () => {
      type StringPaths = PathKeys<string>;
      type NumberPaths = PathKeys<number>;
      type BooleanPaths = PathKeys<boolean>;
      type NullPaths = PathKeys<null>;
      type UndefinedPaths = PathKeys<undefined>;

      expectTypeOf<StringPaths>().toEqualTypeOf<never>();
      expectTypeOf<NumberPaths>().toEqualTypeOf<never>();
      expectTypeOf<BooleanPaths>().toEqualTypeOf<never>();
      expectTypeOf<NullPaths>().toEqualTypeOf<never>();
      expectTypeOf<UndefinedPaths>().toEqualTypeOf<never>();
    });

    it('should handle tuples', () => {
      interface TupleObject {
        tuple: [string, number, { value: boolean }];
      }

      type Paths = PathKeys<TupleObject>;

      const validPaths: Paths[] = ['tuple', 'tuple.0', 'tuple.1', 'tuple.2', 'tuple.2.value', 'tuple.*.value'];

      expect(validPaths).toContain('tuple.2.value');
    });

    it('should handle mixed array and object nesting', () => {
      interface ComplexNesting {
        items: {
          subitems: {
            values: number[];
          }[];
        }[];
      }

      type Paths = PathKeys<ComplexNesting>;

      const validPaths: Paths[] = [
        'items',
        'items.0',
        'items.0.subitems',
        'items.0.subitems.0',
        'items.0.subitems.0.values',
        'items.0.subitems.0.values.0',
        'items.0.subitems.0.values.*',
        'items.0.subitems.*.values',
        'items.0.subitems.*.values.0',
        'items.0.subitems.*.values.*',
        'items.*.subitems',
        'items.*.subitems.0',
        'items.*.subitems.0.values',
        'items.*.subitems.0.values.0',
        'items.*.subitems.0.values.*',
        'items.*.subitems.*.values',
        'items.*.subitems.*.values.0',
        'items.*.subitems.*.values.*'
      ];

      expect(validPaths).toContain('items.*.subitems.*.values.*');
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

      type PokemonPaths = PathKeys<TestPokemon>;

      const pathExamples: PokemonPaths[] = [
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
