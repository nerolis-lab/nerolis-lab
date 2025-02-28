import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import { describe, expect, it } from 'vitest';

describe('calculateSkillProcDistribution', () => {
  it('should return an empty object for an empty array', () => {
    const data: number[] = [];
    const result = calculateDistribution(data);
    expect(result).toEqual({});
  });

  it('should handle an array with one number', () => {
    const data = [5];
    const result = calculateDistribution(data);
    expect(result).toEqual({ 5: 100 });
  });

  it('should calculate distribution for a small array', () => {
    const data = [1, 1, 2, 2, 2, 3];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      1: 33.33,
      2: 50.0,
      3: 16.67
    });
  });

  it('should handle an array with consecutive numbers', () => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      0: 10,
      1: 10,
      2: 10,
      3: 10,
      4: 10,
      5: 10,
      6: 10,
      7: 10,
      8: 10,
      9: 10
    });
  });

  it('should handle an array with a single repeated number', () => {
    const data = [7, 7, 7, 7, 7];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      7: 100
    });
  });

  it('should calculate distribution for large numbers', () => {
    const data = [1000, 1000, 1000, 2000, 3000];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      1000: 60.0,
      2000: 20.0,
      3000: 20.0
    });
  });

  it('should handle non-contiguous numbers', () => {
    const data = [1, 10, 10, 20, 1, 10];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      1: 33.33,
      10: 50.0,
      20: 16.67
    });
  });

  it('should calculate distribution for real-world data', () => {
    const data = [0, 1, 1, 2, 3, 3, 3, 4, 4, 4, 4];
    const result = calculateDistribution(data);
    expect(result).toEqual({
      0: 9.09,
      1: 18.18,
      2: 9.09,
      3: 27.27,
      4: 36.36
    });
  });
});
