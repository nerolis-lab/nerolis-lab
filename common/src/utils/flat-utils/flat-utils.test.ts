import { describe, expect, it } from 'vitest';
import { BERRIES } from '../../types/berry/berries';
import { INGREDIENTS } from '../../types/ingredient/ingredients';
import {
  emptyBerryInventoryFloat,
  emptyBerryInventoryInt,
  emptyIngredientInventoryFloat,
  emptyIngredientInventoryInt,
  getEmptyInventoryFloat,
  initFloatArray,
  initIntArray,
  sumFlats
} from './flat-utils';

describe('flat-utils', () => {
  it('should initialize a Float32Array with given length', () => {
    const length = 5;
    const result = initFloatArray(length);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should initialize an Int16Array with given length', () => {
    const length = 5;
    const result = initIntArray(length);
    expect(result).toBeInstanceOf(Int16Array);
    expect(result.length).toBe(length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should create an empty ingredient inventory as Float32Array', () => {
    const result = emptyIngredientInventoryFloat();
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(INGREDIENTS.length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should create an empty ingredient inventory as Int16Array', () => {
    const result = emptyIngredientInventoryInt();
    expect(result).toBeInstanceOf(Int16Array);
    expect(result.length).toBe(INGREDIENTS.length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should create an empty berry inventory as Float32Array', () => {
    const result = emptyBerryInventoryFloat();
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(BERRIES.length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should create an empty berry inventory as Int16Array', () => {
    const result = emptyBerryInventoryInt();
    expect(result).toBeInstanceOf(Int16Array);
    expect(result.length).toBe(BERRIES.length);
    expect(result.every((value) => value === 0)).toBe(true);
  });

  it('should create an empty inventory with berries and ingredients as Float32Array', () => {
    const result = getEmptyInventoryFloat();
    expect(result.berries).toBeInstanceOf(Float32Array);
    expect(result.berries.length).toBe(BERRIES.length);
    expect(result.berries.every((value) => value === 0)).toBe(true);
    expect(result.ingredients).toBeInstanceOf(Float32Array);
    expect(result.ingredients.length).toBe(INGREDIENTS.length);
    expect(result.ingredients.every((value) => value === 0)).toBe(true);
  });

  it('should sum two Float32Arrays correctly', () => {
    const array1 = new Float32Array([1, 2, 3]);
    const array2 = new Float32Array([4, 5, 6]);
    const result = sumFlats(array1, array2);
    expect(result).toBe(21);
  });

  it('should sum two Float32Arrays of different lengths correctly', () => {
    const array1 = new Float32Array([1, 2, 3]);
    const array2 = new Float32Array([4, 5]);
    const result = sumFlats(array1, array2);
    expect(result).toBe(15);
  });
});
