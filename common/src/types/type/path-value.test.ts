import { describe, it } from 'vitest';
import type { PathValue } from './path-value';

describe('PathValue type utility', () => {
  describe('Simple object paths', () => {
    it('should extract types from flat objects', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      const valid1: PathValue<FlatObject, 'name'> = 'John';
      const valid2: PathValue<FlatObject, 'age'> = 25;
      const valid3: PathValue<FlatObject, 'active'> = true;

      expect(valid1).toBe('John');
      expect(valid2).toBe(25);
      expect(valid3).toBe(true);
    });

    it('should reject invalid paths', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      // @ts-expect-error - Invalid path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<FlatObject, 'invalid'> = 'John';
    });

    it('should reject invalid values', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      // @ts-expect-error - Invalid value, should be string
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<FlatObject, 'name'> = 25;
    });
  });

  describe('Nested object paths', () => {
    interface NestedObject {
      user: {
        name: string;
        profile: {
          age: number;
          city: string;
        };
      };
    }
    it('should extract types from nested objects', () => {
      const valid1: PathValue<NestedObject, 'user'> = { name: 'John', profile: { age: 25, city: 'New York' } };
      const valid2: PathValue<NestedObject, 'user.name'> = 'John';
      const valid3: PathValue<NestedObject, 'user.profile'> = { age: 25, city: 'New York' };
      const valid4: PathValue<NestedObject, 'user.profile.age'> = 25;

      expect(valid1).toEqual({ name: 'John', profile: { age: 25, city: 'New York' } });
      expect(valid2).toBe('John');
      expect(valid3).toEqual({ age: 25, city: 'New York' });
      expect(valid4).toBe(25);
    });

    it('should reject invalid paths', () => {
      // @ts-expect-error - Invalid path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<NestedObject, 'user.invalid'> = 'John';
    });

    it('should reject invalid values', () => {
      // @ts-expect-error - Invalid value
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<NestedObject, 'user.profile.age'> = 'New York';
    });
  });

  describe('Array paths', () => {
    interface ArrayObject {
      numbers: number[];
      strings: readonly string[];
      objects: { id: number; name: string }[];
    }
    it('should extract types from arrays', () => {
      const valid1: PathValue<ArrayObject, 'numbers'> = [1, 2, 3];
      const valid2: PathValue<ArrayObject, 'numbers.0'> = 1;
      const valid3: PathValue<ArrayObject, 'numbers.*'> = 1;
      const valid4: PathValue<ArrayObject, 'objects.0'> = { id: 1, name: 'John' };
      const valid5: PathValue<ArrayObject, 'objects.0.id'> = 1;
      const valid6: PathValue<ArrayObject, 'objects.*.id'> = 1;

      expect(valid1).toEqual([1, 2, 3]);
      expect(valid2).toBe(1);
      expect(valid3).toBe(1);
      expect(valid4).toEqual({ id: 1, name: 'John' });
      expect(valid5).toBe(1);
      expect(valid6).toBe(1);
    });

    it('should reject invalid paths', () => {
      // @ts-expect-error - Invalid path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<ArrayObject, 'numbers.invalid'> = 1;
    });

    it('should reject invalid values', () => {
      // @ts-expect-error - Invalid value
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<ArrayObject, 'numbers.0'> = 'New York';
    });
  });

  describe('Pokemon type paths', () => {
    interface SimplePokemon {
      name: string;
      frequency: number;
      specialty: 'berry' | 'ingredient' | 'skill';
      berry: {
        name: string;
        power: number;
      };
      ingredients: {
        amount: number;
        type: string;
      }[];
    }

    it('should extract types from Pokemon-like structures', () => {
      const valid1: PathValue<SimplePokemon, 'name'> = 'John';
      const valid2: PathValue<SimplePokemon, 'frequency'> = 1;
      const valid3: PathValue<SimplePokemon, 'specialty'> = 'berry';
      const valid4: PathValue<SimplePokemon, 'berry.power'> = 1;
      const valid5: PathValue<SimplePokemon, 'ingredients.*.amount'> = 1;

      expect(valid1).toBe('John');
      expect(valid2).toBe(1);
      expect(valid3).toBe('berry');
      expect(valid4).toBe(1);
      expect(valid5).toBe(1);
    });
  });

  describe('Optional properties', () => {
    interface OptionalProps {
      required: string;
      optional?: number;
      nested?: {
        value: string;
      };
    }

    it('should handle optional properties', () => {
      const valid1: PathValue<OptionalProps, 'required'> = 'John';
      const valid2: PathValue<OptionalProps, 'optional'> = 1;
      const valid3: PathValue<OptionalProps, 'nested.value'> = 'New York';

      expect(valid1).toBe('John');
      expect(valid2).toBe(1);
      expect(valid3).toBe('New York');
    });

    it('should reject invalid paths', () => {
      // @ts-expect-error - Invalid path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<OptionalProps, 'invalid'> = 'John';
    });

    it('should reject invalid values', () => {
      // @ts-expect-error - Invalid value
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<OptionalProps, 'optional'> = 'New York';
    });
  });

  describe('Union types', () => {
    interface UnionProps {
      value: string | number;
      array: (string | number)[];
    }
    it('should handle union types', () => {
      const valid1: PathValue<UnionProps, 'value'> = 'John';
      const valid2: PathValue<UnionProps, 'array.*'> = 'John';

      expect(valid1).toBe('John');
      expect(valid2).toBe('John');
    });

    it('should reject invalid paths', () => {
      // @ts-expect-error - Invalid path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<UnionProps, 'invalid'> = 'John';
    });

    it('should reject invalid values', () => {
      // @ts-expect-error - Invalid value
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalid1: PathValue<UnionProps, 'array.0'> = true;
    });
  });

  describe('Complex nested arrays', () => {
    it('should handle deeply nested array structures', () => {
      interface ComplexArray {
        matrix: number[][];
        items: {
          subitems: {
            values: string[];
          }[];
        }[];
      }

      const valid1: PathValue<ComplexArray, 'matrix'> = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const valid2: PathValue<ComplexArray, 'matrix.0'> = [1, 2, 3];
      const valid3: PathValue<ComplexArray, 'matrix.0.0'> = 1;
      const valid4: PathValue<ComplexArray, 'items.*.subitems.*.values'> = ['John', 'Jane'];
      const valid5: PathValue<ComplexArray, 'items.*.subitems.*.values.*'> = 'John';

      expect(valid1).toEqual([
        [1, 2, 3],
        [4, 5, 6]
      ]);
      expect(valid2).toEqual([1, 2, 3]);
      expect(valid3).toEqual(1);
      expect(valid4).toEqual(['John', 'Jane']);
      expect(valid5).toEqual('John');
    });

    it('should handle deep matrix access correctly (regression test)', () => {
      interface Matrix {
        data: number[][];
      }

      const valid1: PathValue<Matrix, 'data'> = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const valid2: PathValue<Matrix, 'data.0'> = [1, 2, 3];
      const valid3: PathValue<Matrix, 'data.0.0'> = 1;
      const valid4: PathValue<Matrix, 'data.1.5'> = 6;

      // Regression test: ensure deeply nested array access returns the element type, not array type
      expect(valid1).toEqual([
        [1, 2, 3],
        [4, 5, 6]
      ]);
      expect(valid2).toEqual([1, 2, 3]);
      expect(valid3).toEqual(1);
      expect(valid4).toEqual(6);
    });
  });
});
