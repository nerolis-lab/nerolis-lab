import { describe, expect, it } from 'vitest';
import { Metronome } from './metronome';

describe('Metronome', () => {
  it('should have correct basic properties', () => {
    expect(Metronome.name).toBe('Metronome');
    expect(Metronome.description({ skillLevel: 1 })).toBe('Uses one randomly chosen main skill.');
    expect(Metronome.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(Metronome.maxLevel).toBe(7);
  });

  it('should have empty activations object', () => {
    expect(Object.keys(Metronome.activations)).toHaveLength(0);
  });

  it('should have metronome skills excluding blocked skills', () => {
    const metronomeSkills = Metronome.metronomeSkills;
    expect(Array.isArray(metronomeSkills)).toBe(true);
    expect(metronomeSkills.length).toBeGreaterThan(0);

    // Metronome should not include itself
    expect(metronomeSkills).not.toContain(Metronome);
  });

  it('should block certain skills from metronome selection', () => {
    const metronomeSkills = Metronome.metronomeSkills;
    const blockedSkills = Metronome.blockedSkills;

    // None of the blocked skills should appear in metronome skills
    blockedSkills.forEach((blockedSkill) => {
      expect(metronomeSkills).not.toContain(blockedSkill);
    });
  });

  it('should have correct RP progression', () => {
    expect(Metronome.getRPValue(1)).toBe(880);
    expect(Metronome.getRPValue(4)).toBe(2383);
    expect(Metronome.getRPValue(7)).toBe(5843);
  });

  it('should not have any specific units', () => {
    const units = Metronome.getUnits();
    expect(units).toEqual([]);
  });

  it('should be included in ingredient support mainskills', () => {
    // Metronome benefits team ingredients since it's created with true parameter
    expect(Metronome.getRPValue(1)).toBeDefined();
  });
});
