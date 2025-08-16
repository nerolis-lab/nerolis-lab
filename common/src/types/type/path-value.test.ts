import { describe, expectTypeOf, it } from 'vitest';
import type { PathValue } from './path-value';

describe('PathValue type utility', () => {
  describe('Simple object paths', () => {
    it('should extract types from flat objects', () => {
      interface FlatObject {
        name: string;
        age: number;
        active: boolean;
      }

      type NameType = PathValue<FlatObject, 'name'>;
      type AgeType = PathValue<FlatObject, 'age'>;
      type ActiveType = PathValue<FlatObject, 'active'>;

      expectTypeOf<NameType>().toEqualTypeOf<string>();
      expectTypeOf<AgeType>().toEqualTypeOf<number>();
      expectTypeOf<ActiveType>().toEqualTypeOf<boolean>();
    });
  });

  describe('Nested object paths', () => {
    it('should extract types from nested objects', () => {
      interface NestedObject {
        user: {
          name: string;
          profile: {
            age: number;
            city: string;
          };
        };
      }

      type UserType = PathValue<NestedObject, 'user'>;
      type UserNameType = PathValue<NestedObject, 'user.name'>;
      type ProfileType = PathValue<NestedObject, 'user.profile'>;
      type AgeType = PathValue<NestedObject, 'user.profile.age'>;

      expectTypeOf<UserNameType>().toEqualTypeOf<string>();
      expectTypeOf<AgeType>().toEqualTypeOf<number>();
      expectTypeOf<UserType>().toEqualTypeOf<NestedObject['user']>();
      expectTypeOf<ProfileType>().toEqualTypeOf<NestedObject['user']['profile']>();
    });
  });

  describe('Array paths', () => {
    it('should extract types from arrays', () => {
      interface ArrayObject {
        numbers: number[];
        strings: readonly string[];
        objects: { id: number; name: string }[];
      }

      type NumbersType = PathValue<ArrayObject, 'numbers'>;
      type NumberElementType = PathValue<ArrayObject, 'numbers.0'>;
      type NumberWildcardType = PathValue<ArrayObject, 'numbers.*'>;

      type ObjectElementType = PathValue<ArrayObject, 'objects.0'>;
      type ObjectIdType = PathValue<ArrayObject, 'objects.0.id'>;
      type ObjectWildcardIdType = PathValue<ArrayObject, 'objects.*.id'>;

      expectTypeOf<NumbersType>().toEqualTypeOf<number[]>();
      expectTypeOf<NumberElementType>().toEqualTypeOf<number>();
      expectTypeOf<NumberWildcardType>().toEqualTypeOf<number>();

      expectTypeOf<ObjectElementType>().toEqualTypeOf<{ id: number; name: string }>();
      expectTypeOf<ObjectIdType>().toEqualTypeOf<number>();
      expectTypeOf<ObjectWildcardIdType>().toEqualTypeOf<number>();
    });
  });

  describe('Pokemon type paths', () => {
    it('should extract types from Pokemon-like structures', () => {
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

      type NameType = PathValue<SimplePokemon, 'name'>;
      type FrequencyType = PathValue<SimplePokemon, 'frequency'>;
      type SpecialtyType = PathValue<SimplePokemon, 'specialty'>;
      type BerryPowerType = PathValue<SimplePokemon, 'berry.power'>;
      type IngredientAmountType = PathValue<SimplePokemon, 'ingredients.*.amount'>;

      expectTypeOf<NameType>().toEqualTypeOf<string>();
      expectTypeOf<FrequencyType>().toEqualTypeOf<number>();
      expectTypeOf<SpecialtyType>().toEqualTypeOf<'berry' | 'ingredient' | 'skill'>();
      expectTypeOf<BerryPowerType>().toEqualTypeOf<number>();
      expectTypeOf<IngredientAmountType>().toEqualTypeOf<number>();
    });
  });

  describe('Optional properties', () => {
    it('should handle optional properties', () => {
      interface OptionalProps {
        required: string;
        optional?: number;
        nested?: {
          value: string;
        };
      }

      type RequiredType = PathValue<OptionalProps, 'required'>;
      type OptionalType = PathValue<OptionalProps, 'optional'>;
      type NestedValueType = PathValue<OptionalProps, 'nested.value'>;

      expectTypeOf<RequiredType>().toEqualTypeOf<string>();
      expectTypeOf<OptionalType>().toEqualTypeOf<number | undefined>();
      expectTypeOf<NestedValueType>().toEqualTypeOf<string>();
    });
  });

  describe('Union types', () => {
    it('should handle union types', () => {
      interface UnionProps {
        value: string | number;
        array: (string | number)[];
      }

      type ValueType = PathValue<UnionProps, 'value'>;
      type ArrayElementType = PathValue<UnionProps, 'array.*'>;

      expectTypeOf<ValueType>().toEqualTypeOf<string | number>();
      expectTypeOf<ArrayElementType>().toEqualTypeOf<string | number>();
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

      type MatrixType = PathValue<ComplexArray, 'matrix'>;
      type MatrixRowType = PathValue<ComplexArray, 'matrix.0'>;
      type MatrixElementType = PathValue<ComplexArray, 'matrix.0.0'>;

      type SubitemValuesType = PathValue<ComplexArray, 'items.*.subitems.*.values'>;
      type SubitemValueType = PathValue<ComplexArray, 'items.*.subitems.*.values.*'>;

      expectTypeOf<MatrixType>().toEqualTypeOf<number[][]>();
      expectTypeOf<MatrixRowType>().toEqualTypeOf<number[]>();
      expectTypeOf<MatrixElementType>().toEqualTypeOf<number>();

      expectTypeOf<SubitemValuesType>().toEqualTypeOf<string[]>();
      expectTypeOf<SubitemValueType>().toEqualTypeOf<string>();
    });

    it('should handle deep matrix access correctly (regression test)', () => {
      interface Matrix {
        data: number[][];
      }

      type MatrixType = PathValue<Matrix, 'data'>;
      type RowType = PathValue<Matrix, 'data.0'>;
      type ElementType = PathValue<Matrix, 'data.0.0'>;
      type SecondElementType = PathValue<Matrix, 'data.1.5'>;

      // Regression test: ensure deeply nested array access returns the element type, not array type
      expectTypeOf<MatrixType>().toEqualTypeOf<number[][]>();
      expectTypeOf<RowType>().toEqualTypeOf<number[]>();
      expectTypeOf<ElementType>().toEqualTypeOf<number>(); // This was returning number[] before the fix
      expectTypeOf<SecondElementType>().toEqualTypeOf<number>();

      // Note: 3D array access (data.0.0.0) requires more complex PathValue implementation
      // Currently limited to 2D array access which covers the main use cases
    });
  });

  describe('Invalid paths', () => {
    it('should return never for invalid paths', () => {
      interface TestObject {
        name: string;
        age: number;
      }

      type InvalidPath1 = PathValue<TestObject, 'invalid'>;
      type InvalidPath2 = PathValue<TestObject, 'name.invalid'>;

      expectTypeOf<InvalidPath1>().toEqualTypeOf<never>();
      expectTypeOf<InvalidPath2>().toEqualTypeOf<never>();
    });
  });
});
