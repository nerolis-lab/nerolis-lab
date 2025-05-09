/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import seedrandom from 'seedrandom';

const FIXED_SEED = 'seed';

const UINT8_MAX = 255;

/**
 * Global store for pre-generated random numbers, shared among
 * all instances of EnhancedRandom
 */
export class RandomNumberStore {
  private static instance: RandomNumberStore;
  private randomNumbers: Uint8Array;
  private readonly size: number;

  private constructor(size: number = 10_000_000) {
    this.size = size;
    this.randomNumbers = new Uint8Array(size);
    this.initialize();
  }

  public static getInstance(size?: number): RandomNumberStore {
    if (!RandomNumberStore.instance) {
      RandomNumberStore.instance = new RandomNumberStore(size);
    }
    return RandomNumberStore.instance;
  }

  private initialize(): void {
    const rng = seedrandom.alea(FIXED_SEED);
    for (let i = 0; i < this.size; i++) {
      // Convert float [0,1) to uint8 [0,255]
      // Using Math.floor ensures we get values [0,255] inclusive
      // and never 256, maintaining the exclusive upper bound behavior
      this.randomNumbers[i] = Math.floor(rng() * UINT8_MAX);
    }
  }

  /**
   * Get a random number at a specific index
   * @param index The index to get the random number from
   * @returns A random number between 0 and 1
   */
  public getRandomNumber(index: number): number {
    // Convert uint8 [0,255] back to float [0,1)
    // Division by UINT8_MAX+1 ensures we get [0,1) with exclusive upper bound
    return this.randomNumbers[index] / (UINT8_MAX + 1);
  }

  /**
   * Get the raw uint8 value at a specific index
   * @param index The index to get the random number from
   * @returns A uint8 value between 0 and 255
   */
  public getRawUint8(index: number): number {
    return this.randomNumbers[index];
  }

  public getSize(): number {
    return this.size;
  }
}

/**
 * Custom type for our enhanced random number generator
 */
export interface PreGeneratedRandom {
  /**
   * Get a random number between 0 and 1
   * @returns A random number between 0 and 1
   */
  (): number;
  /**
   * Get a raw uint8 value (0-255)
   * @returns A uint8 value between 0 and 255
   */
  getUint8(): number;
  /**
   * Get the current index
   * @returns The current index
   */
  getIndex(): number;
  /**
   * Get a random element from an array
   * @param array The array to get a random element from
   * @returns A random element from the array
   */
  randomElement<T>(array: T[]): T;
}

/**
 * Create an EnhancedRandom object which produces a deterministic
 * sequence of random numbers
 * @returns An EnhancedRandom object
 */
export function createPreGeneratedRandom(): PreGeneratedRandom {
  const store = RandomNumberStore.getInstance();
  let index = 0;

  const randomFn = function (): number {
    const value = store.getRandomNumber(index);
    index = (index + 1) % store.getSize();
    return value;
  };

  randomFn.getUint8 = function (): number {
    const value = store.getRawUint8(index);
    index = (index + 1) % store.getSize();
    return value;
  };

  randomFn.getIndex = function (): number {
    return index;
  };

  randomFn.randomElement = function <T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot get random element from empty array');
    }
    const randomIndex = Math.floor(randomFn() * array.length);
    return array[randomIndex];
  };

  return randomFn as PreGeneratedRandom;
}

/**
 * Alias for createPreGeneratedRandom to mimic seedrandom.alea interface
 */
export const alea = createPreGeneratedRandom;
