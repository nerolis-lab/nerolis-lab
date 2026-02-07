import { describe, expect, it } from 'vitest';
import { chunkArray, convertFloat32ToInt16, splitArrayByCondition } from './array-utils.js';

describe('chunkArray', () => {
  it('should chunk an array into specified sizes', () => {
    const inputArray = [1, 2, 3, 4, 5, 6];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5, 6]);
  });

  it('should handle arrays that do not divide evenly', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5]);
  });

  it('should return an empty array when the input array is empty', () => {
    const inputArray: string[] = [];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(0);
  });

  it('should handle chunk size larger than the array', () => {
    const inputArray = [1, 2, 3];
    const chunkSize = 5;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual([1, 2, 3]);
  });
});
describe('splitArrayByCondition', () => {
  it('should split array based on the condition function', () => {
    const inputArray = [1, 2, 3, 4, 5, 6];
    const conditionFn = (item: number) => item % 2 === 0;

    const [truthy, falsy] = splitArrayByCondition(inputArray, conditionFn);

    expect(truthy).toEqual([2, 4, 6]);
    expect(falsy).toEqual([1, 3, 5]);
  });

  it('should return all elements in falsy array if condition is never met', () => {
    const inputArray = [1, 3, 5];
    const conditionFn = (item: number) => item % 2 === 0;

    const [truthy, falsy] = splitArrayByCondition(inputArray, conditionFn);

    expect(truthy).toEqual([]);
    expect(falsy).toEqual([1, 3, 5]);
  });

  it('should return all elements in truthy array if condition is always met', () => {
    const inputArray = [2, 4, 6];
    const conditionFn = (item: number) => item % 2 === 0;

    const [truthy, falsy] = splitArrayByCondition(inputArray, conditionFn);

    expect(truthy).toEqual([2, 4, 6]);
    expect(falsy).toEqual([]);
  });
});

describe('convertFloat32ToInt16', () => {
  it('should convert Float32Array to Int16Array', () => {
    const inputArray = new Float32Array([1.1, 2.5, 3.9, 4.4]);
    const result = convertFloat32ToInt16(inputArray);

    expect(result).toBeInstanceOf(Int16Array);
    expect(result).toEqual(new Int16Array([1, 3, 4, 4]));
  });

  it('should handle an empty Float32Array', () => {
    const inputArray = new Float32Array([]);
    const result = convertFloat32ToInt16(inputArray);

    expect(result).toBeInstanceOf(Int16Array);
    expect(result).toEqual(new Int16Array([]));
  });
});
