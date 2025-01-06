import { describe, expect, test } from 'vitest';
import './Float32Array';

describe('Float32Array prototype extensions', () => {
  test('_mutateCombine should mutate the array with a binary operation', () => {
    const arr1 = new Float32Array([1, 2, 3]);
    const arr2 = new Float32Array([4, 5, 6]);
    arr1._mutateCombine(arr2, (a, b) => a + b);
    expect(arr1).toEqual(new Float32Array([5, 7, 9]));
  });

  test('_mutateUnary should mutate the array with a unary operation', () => {
    const arr = new Float32Array([1, 2, 3]);
    arr._mutateUnary((a) => a * 2);
    expect(arr).toEqual(new Float32Array([2, 4, 6]));
  });

  test('_mapCombine should create a new array with a binary operation', () => {
    const arr1 = new Float32Array([1, 2, 3]);
    const arr2 = new Float32Array([4, 5, 6]);
    const result = arr1._mapCombine(arr2, (a, b) => a * b);
    expect(result).toEqual(new Float32Array([4, 10, 18]));
    expect(arr1).toEqual(new Float32Array([1, 2, 3])); // original array should not be mutated
  });

  test('_mapUnary should create a new array with a unary operation', () => {
    const arr = new Float32Array([1, 2, 3]);
    const result = arr._mapUnary((a) => a + 1);
    expect(result).toEqual(new Float32Array([2, 3, 4]));
    expect(arr).toEqual(new Float32Array([1, 2, 3])); // original array should not be mutated
  });
});
