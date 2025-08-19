import { describe, expect, it } from 'vitest';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';
import { SkillCopy } from './skill-copy';

describe('SkillCopy', () => {
  it('should have correct basic properties', () => {
    expect(SkillCopy.name).toBe('Skill Copy');
    expect(SkillCopy.description({ skillLevel: 1 })).toBe(
      'Copies and performs the main skill of one randomly selected Pokémon on the team.'
    );
    expect(SkillCopy.RP).toEqual([600, 853, 1177, 1625, 2243, 3099, 3984]);
    expect(SkillCopy.maxLevel).toBe(7);
  });

  it('should have empty activations object', () => {
    expect(Object.keys(SkillCopy.activations)).toHaveLength(0);
  });

  it('should have blocked skills list', () => {
    expect(Array.isArray(SkillCopy.blockedSkills)).toBe(true);
    expect(SkillCopy.blockedSkills).toContain(SkillCopy);
    expect(SkillCopy.blockedSkills).toContain(ChargeStrengthMBadDreams);
    expect(SkillCopy.blockedSkills).toContain(BerryBurstDisguise);
  });

  it('should have copy skills excluding blocked skills', () => {
    const copySkills = SkillCopy.copySkills;
    expect(Array.isArray(copySkills)).toBe(true);
    expect(copySkills.length).toBeGreaterThan(0);

    // Should not include any blocked skills
    SkillCopy.blockedSkills.forEach((blockedSkill) => {
      expect(copySkills).not.toContain(blockedSkill);
    });
  });

  it('should not have any specific units', () => {
    const units = SkillCopy.getUnits();
    expect(units).toEqual([]);
  });

  it('should have specific RP values', () => {
    expect(SkillCopy.getRPValue(1)).toBe(600);
    expect(SkillCopy.getRPValue(4)).toBe(1625);
    expect(SkillCopy.getRPValue(7)).toBe(3984);
  });
});
