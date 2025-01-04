import { describe, expect, it } from 'vitest';
import './Int16Array';

describe('Int16Array prototype extensions', () => {
  it('_mutateCombine should mutate the array by applying a binary operation', () => {
    const arr1 = new Int16Array([1, 2, 3]);
    const arr2 = new Int16Array([4, 5, 6]);
    arr1._mutateCombine(arr2, (a, b) => a + b);
    expect(arr1).toEqual(new Int16Array([5, 7, 9]));
  });

  it('_mutateUnary should mutate the array by applying a unary operation', () => {
    const arr = new Int16Array([1, 2, 3]);
    arr._mutateUnary((a) => a * 2);
    expect(arr).toEqual(new Int16Array([2, 4, 6]));
  });

  it('_mapCombine should create a new array by applying a binary operation', () => {
    const arr1 = new Int16Array([1, 2, 3]);
    const arr2 = new Int16Array([4, 5, 6]);
    const result = arr1._mapCombine(arr2, (a, b) => a + b);
    expect(result).toEqual(new Int16Array([5, 7, 9]));
  });

  it('_mapUnary should create a new array by applying a unary operation', () => {
    const arr = new Int16Array([1, 2, 3]);
    const result = arr._mapUnary((a) => a * 2);
    expect(result).toEqual(new Int16Array([2, 4, 6]));
  });

  it('_mutateAdd should mutate the array by adding another array element-wise', () => {
    const arr1 = new Int16Array([1, 2, 3]);
    const arr2 = new Int16Array([4, 5, 6]);
    arr1._mutateAdd(arr2);
    expect(arr1).toEqual(new Int16Array([5, 7, 9]));
  });

  it('_mutateSubClamp should mutate the array by subtracting another array element-wise and clamping to a minimum of 0', () => {
    const arr1 = new Int16Array([5, 3, 1]);
    const arr2 = new Int16Array([4, 5, 6]);
    arr1._mutateSubClamp(arr2);
    expect(arr1).toEqual(new Int16Array([1, 0, 0]));
  });

  it('_mapSubClamp should create a new array by subtracting another array element-wise and clamping to a minimum of 0', () => {
    const arr1 = new Int16Array([5, 3, 1]);
    const arr2 = new Int16Array([4, 5, 6]);
    const result = arr1._mapSubClamp(arr2);
    expect(result).toEqual(new Int16Array([1, 0, 0]));
  });
});
