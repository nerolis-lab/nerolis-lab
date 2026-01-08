import { describe, expect, it } from 'vitest';
import { MathUtils } from '../../utils/math-utils/math-utils';

describe('floor', () => {
  it('shall floor to specific decimal precision', () => {
    expect(MathUtils.floor(3.56789, 4)).toBe(3.5678);
  });

  it('shall floor to whole integer', () => {
    expect(MathUtils.floor(3.56789, 0)).toBe(3);
  });

  it('shall calculate and floor to 1 decimal negative', () => {
    expect(MathUtils.floor(-0.26, 1)).toBe(-0.3);
  });
});

describe('ceil', () => {
  it('shall ceil to specific decimal precision', () => {
    expect(MathUtils.ceil(3.56789, 4)).toBe(3.5679);
  });

  it('shall ceil to whole integer', () => {
    expect(MathUtils.ceil(3.56789, 0)).toBe(4);
  });

  it('shall calculate and ceil to 1 decimal negative', () => {
    expect(MathUtils.ceil(-0.26, 1)).toBe(-0.2);
  });

  it('shall ceil to two decimal places', () => {
    expect(MathUtils.ceil(1.501, 1)).toBe(1.6);
    expect(MathUtils.ceil(1.549, 1)).toBe(1.6);
  });
});

describe('round', () => {
  it('shall round to one decimal', () => {
    expect(MathUtils.round(1.1111, 1)).toBe(1.1);
  });

  it('shall calculate and round to two decimals', () => {
    expect(MathUtils.round(1.567, 2)).toBe(1.57);
  });

  it('shall calculate and round to four decimals', () => {
    expect(MathUtils.round(1.23456, 4)).toBe(1.2346);
  });

  it('shall calculate and round to 1 decimal negative', () => {
    expect(MathUtils.round(-0.26, 1)).toBe(-0.3);
  });
});

describe('floorWithPrecision', () => {
  describe('normal cases', () => {
    it('shall floor to two decimal places', () => {
      expect(MathUtils.floorWithIEEE754Correction(3.56789, 2)).toBe(3.56);
    });

    it('shall floor negative numbers towards negative infinity', () => {
      expect(MathUtils.floorWithIEEE754Correction(-2.789, 2)).toBe(-2.79);
    });

    it('shall handle zero', () => {
      expect(MathUtils.floorWithIEEE754Correction(0, 2)).toBe(0);
    });
  });

  describe('floating-point precision issues', () => {
    it('shall correct IEEE 754 arithmetic errors', () => {
      const result = 0.83 * 10; // This gives 8.299999999999999 due to IEEE 754
      expect(result).toBe(8.299999999999999); // Verify the precision error exists
      expect(MathUtils.floorWithIEEE754Correction(result, 2)).toBe(8.3); // Should correct to 8.3
    });

    it('shall handle classic floating-point addition errors', () => {
      const result = 0.1 + 0.2; // This gives 0.30000000000000004 due to IEEE 754
      expect(result).toBe(0.30000000000000004); // Verify the precision error exists
      expect(MathUtils.floorWithIEEE754Correction(result, 1)).toBe(0.3); // Should correct to 0.3
    });

    it('shall handle negative numbers with precision issues', () => {
      // Negative version of the same IEEE 754 error
      const result = -0.83 * 10; // This gives -8.299999999999999
      expect(result).toBe(-8.299999999999999); // Verify the precision error exists
      expect(MathUtils.floorWithIEEE754Correction(result, 2)).toBe(-8.3); // Should correct to -8.3 (towards negative infinity)
    });

    it('shall handle zero precision (floor to integer)', () => {
      // Example: Complex calculation that's very close to 100
      expect(MathUtils.floorWithIEEE754Correction(99.999999999999, 0)).toBe(100);
    });
  });

  describe('RP calculation consistency', () => {
    it('shall produce results needed for RP calculations', () => {
      const testValues = [
        { value: 8.299999999999999, decimals: 2, expected: 8.3 },
        { value: 102.91, decimals: 2, expected: 102.91 },
        { value: 1754.81, decimals: 2, expected: 1754.81 },
        { value: 398.99, decimals: 2, expected: 398.99 }
      ];

      testValues.forEach(({ value, decimals, expected }) => {
        expect(MathUtils.floorWithIEEE754Correction(value, decimals)).toBe(expected);
      });
    });
  });
});
