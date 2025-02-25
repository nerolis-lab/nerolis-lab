/**
 * Copyright 2024 Sleep API Authors
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
import type { PRNG } from 'seedrandom';

// Fixed seed for consistent random number generation
const FIXED_SEED = 'seed';

/**
 * Global store for pre-generated random numbers
 */
export class RandomNumberStore {
  private static instance: RandomNumberStore;
  private randomNumbers: Float64Array;
  private initialized = false;
  private readonly size: number;

  private constructor(size: number = 10_000_000) {
    this.size = size;
    this.randomNumbers = new Float64Array(size);
  }

  /**
   * Get the singleton instance of RandomNumberStore
   */
  public static getInstance(size?: number): RandomNumberStore {
    if (!RandomNumberStore.instance) {
      RandomNumberStore.instance = new RandomNumberStore(size);
    }
    return RandomNumberStore.instance;
  }

  /**
   * Initialize the random number store with pre-generated values
   */
  public initialize(): void {
    if (this.initialized) {
      return;
    }

    const rng = seedrandom.alea(FIXED_SEED);
    for (let i = 0; i < this.size; i++) {
      this.randomNumbers[i] = rng();
    }
    this.initialized = true;
  }

  /**
   * Get a random number at a specific index
   * @param index The index to get the random number from
   * @returns A random number between 0 and 1
   */
  public getRandomNumber(index: number): number {
    if (!this.initialized) {
      this.initialize();
    }
    return this.randomNumbers[index % this.size];
  }

  /**
   * Get the size of the random number store
   */
  public getSize(): number {
    return this.size;
  }
}

/**
 * Factory function to create a seedrandom.PRNG compatible object
 * that uses pre-generated random numbers
 * @returns A PRNG compatible object
 */
export function createPreGeneratedRandom(): PRNG {
  const store = RandomNumberStore.getInstance();
  store.initialize();

  let index = 0;

  // Create the base random function
  const randomFn = function (): number {
    const value = store.getRandomNumber(index);
    index = (index + 1) % store.getSize();
    return value;
  };

  return randomFn as unknown as PRNG;
}

/**
 * Alias for createPreGeneratedRandom to mimic seedrandom.alea interface
 */
export const alea = createPreGeneratedRandom;
