import { describe, expect, it } from 'vitest';
import { rollToOutput } from './mainskill-utils';

describe('rollToOutput', () => {
  const mockProbabilities: Record<string, number> = {
    apples: 10,
    bananas: 20,
    carrots: 30,
    durians: 40
  };

  const mockRatios: Record<string, number> = {
    one: 1,
    three: 3
  };

  it('shall return first key when 0 is rolled', () => {
    expect(rollToOutput(0, mockProbabilities)).toBe('apples');
    expect(rollToOutput(0, mockRatios)).toBe('one');
  });

  it('shall return first key when invalid rolls are given', () => {
    expect(rollToOutput(-1, mockProbabilities)).toBe('apples');
    expect(rollToOutput(2, mockRatios)).toBe('one');
  });

  it('shall return each key when given appropriate rolls', () => {
    expect(rollToOutput(0.05, mockProbabilities)).toBe('apples');
    expect(rollToOutput(0.2, mockProbabilities)).toBe('bananas');
    expect(rollToOutput(0.45, mockProbabilities)).toBe('carrots');
    expect(rollToOutput(0.8, mockProbabilities)).toBe('durians');
    expect(rollToOutput(0.125, mockRatios)).toBe('one');
    expect(rollToOutput(0.625, mockRatios)).toBe('three');
  });

  it('shall return a key based on the probability of the key', () => {
    expect(rollToOutput(0, mockRatios)).toBe('one');
    expect(rollToOutput(0.24, mockRatios)).toBe('one');
    expect(rollToOutput(0.25, mockRatios)).toBe('three');
    expect(rollToOutput(0.99, mockRatios)).toBe('three');
  });
});
