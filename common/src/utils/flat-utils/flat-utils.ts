import type { ProduceFlat } from '../../api/production/produce';
import { TOTAL_NUMBER_OF_BERRIES } from '../../domain/berry/berries';
import { TOTAL_NUMBER_OF_INGREDIENTS } from '../../domain/ingredient/ingredients';

export function initFloatArray(length: number) {
  return new Float32Array(length);
}
export function initIntArray(length: number) {
  return new Int16Array(length);
}

export function emptyIngredientInventoryFloat(): Float32Array {
  return initFloatArray(TOTAL_NUMBER_OF_INGREDIENTS);
}
export function emptyIngredientInventoryInt(): Int16Array {
  return initIntArray(TOTAL_NUMBER_OF_INGREDIENTS);
}

export function emptyBerryInventoryFloat(): Float32Array {
  return initFloatArray(TOTAL_NUMBER_OF_BERRIES);
}
export function emptyBerryInventoryInt(): Int16Array {
  return initIntArray(TOTAL_NUMBER_OF_BERRIES);
}

export function getEmptyInventoryFloat(): ProduceFlat {
  return {
    berries: emptyBerryInventoryFloat(),
    ingredients: emptyIngredientInventoryFloat()
  };
}

export function sumFlats(array1: Float32Array, array2: Float32Array) {
  const minLength = Math.min(array1.length, array2.length);
  const maxArray = array1.length > array2.length ? array1 : array2;
  let sum = 0;

  for (let i = 0; i < minLength; i++) {
    sum += array1[i] + array2[i];
  }

  for (let i = minLength; i < maxArray.length; i++) {
    sum += maxArray[i];
  }

  return sum;
}
