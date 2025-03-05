import { describe, it, expect } from 'vitest';
import { createPreGeneratedRandom, alea } from './pre-generated-random.js';

describe('Pre-generated Random', () => {
  // Test 2: Deterministic Sequence Test
  describe('Deterministic Sequence', () => {
    it('should produce the same sequence of numbers when called multiple times', () => {
      // Create two separate random generators
      const random1 = createPreGeneratedRandom();
      const random2 = createPreGeneratedRandom();

      // Generate a sequence of numbers from each
      const sequence1: number[] = [];
      const sequence2: number[] = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(random1());
        sequence2.push(random2());
      }

      // Verify that both sequences are identical
      expect(sequence1).toEqual(sequence2);
    });

    it('should produce the same sequence of uint8 values when called multiple times', () => {
      // Create two separate random generators
      const random1 = createPreGeneratedRandom();
      const random2 = createPreGeneratedRandom();

      // Generate a sequence of uint8 values from each
      const sequence1: number[] = [];
      const sequence2: number[] = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(random1.getUint8());
        sequence2.push(random2.getUint8());
      }

      // Verify that both sequences are identical
      expect(sequence1).toEqual(sequence2);
    });

    it('should produce the same sequence when using alea alias', () => {
      // Create a random generator using createPreGeneratedRandom
      const random1 = createPreGeneratedRandom();
      // Create a random generator using the alea alias
      const random2 = alea();

      // Generate a sequence of numbers from each
      const sequence1: number[] = [];
      const sequence2: number[] = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(random1());
        sequence2.push(random2());
      }

      // Verify that both sequences are identical
      expect(sequence1).toEqual(sequence2);
    });
  });

  // Test 3: Range Test
  describe('Range Verification', () => {
    it('should produce values between 0 and 1 (exclusive) for the main function', () => {
      const random = createPreGeneratedRandom();

      // Generate a large number of random values
      const values: number[] = [];
      for (let i = 0; i < 100; i++) {
        values.push(random());
      }

      // Verify that all values are within the expected range
      for (const value of values) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should produce uint8 values between 0 and 255 (inclusive) for getUint8', () => {
      const random = createPreGeneratedRandom();

      // Generate a large number of uint8 values
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(random.getUint8());
      }

      // Verify that all values are within the expected range
      for (const value of values) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  // Test 4: Index Tracking Test
  describe('Index Tracking', () => {
    it('should correctly track the current index', () => {
      const random = createPreGeneratedRandom();

      // Initial index should be 0
      expect(random.getIndex()).toBe(0);

      // After calling the main function, index should increment
      random();
      expect(random.getIndex()).toBe(1);

      // After calling getUint8, index should increment again
      random.getUint8();
      expect(random.getIndex()).toBe(2);

      // After multiple calls, index should reflect the total number of calls
      for (let i = 0; i < 10; i++) {
        random();
      }
      expect(random.getIndex()).toBe(12);
    });

    it('should maintain separate indices for different instances', () => {
      const random1 = createPreGeneratedRandom();
      const random2 = createPreGeneratedRandom();

      // Initial indices should both be 0
      expect(random1.getIndex()).toBe(0);
      expect(random2.getIndex()).toBe(0);

      // After calling random1, only its index should increment
      random1();
      random1();
      expect(random1.getIndex()).toBe(2);
      expect(random2.getIndex()).toBe(0);

      // After calling random2, only its index should increment
      random2();
      expect(random1.getIndex()).toBe(2);
      expect(random2.getIndex()).toBe(1);
    });
  });
});
