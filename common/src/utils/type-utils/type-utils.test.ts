import { describe, expect, it } from 'vitest';
import { isDefined } from './type-utils';

describe('isDefined', () => {
  it('returns false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });

  it('returns true for empty string', () => {
    expect(isDefined('')).toBe(true);
  });

  it('returns true for zero', () => {
    expect(isDefined(0)).toBe(true);
  });

  it('returns true for false (boolean)', () => {
    expect(isDefined(false)).toBe(true);
  });

  it('returns true for an empty array', () => {
    expect(isDefined([])).toBe(true);
  });

  it('returns true for an object', () => {
    expect(isDefined({})).toBe(true);
  });
});
