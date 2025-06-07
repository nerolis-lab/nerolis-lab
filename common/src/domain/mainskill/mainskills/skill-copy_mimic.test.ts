import { describe, expect, it } from 'vitest';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';
import { SkillCopy } from './skill-copy';
import { SkillCopyMimic } from './skill-copy_mimic';

describe('SkillCopyMimic', () => {
  it('should have modified name format', () => {
    expect(SkillCopyMimic.name).toBe('Mimic (Skill Copy)');
    expect(SkillCopyMimic.modifierName).toBe('Mimic');
    expect(SkillCopyMimic.baseSkill).toBe(SkillCopy);
  });

  it('should have correct basic properties', () => {
    expect(SkillCopyMimic.name).toBe('Mimic (Skill Copy)');
    expect(SkillCopyMimic.description(1)).toBe(
      'Copies and performs the main skill of one randomly selected Pokémon on the team.'
    );
    expect(SkillCopyMimic.RP).toEqual([600, 853, 1177, 1625, 2243, 3099, 3984]);
    expect(SkillCopyMimic.maxLevel).toBe(7);
  });

  it('should have empty activations object', () => {
    expect(Object.keys(SkillCopyMimic.activations)).toHaveLength(0);
  });

  it('should have blocked skills list', () => {
    expect(Array.isArray(SkillCopyMimic.blockedSkills)).toBe(true);
    expect(SkillCopyMimic.blockedSkills).toContain(SkillCopyMimic);
    expect(SkillCopyMimic.blockedSkills).toContain(ChargeStrengthMBadDreams);
    expect(SkillCopyMimic.blockedSkills).toContain(BerryBurstDisguise);
  });

  it('should have copy skills excluding blocked skills', () => {
    const copySkills = SkillCopyMimic.copySkills;
    expect(Array.isArray(copySkills)).toBe(true);
    expect(copySkills.length).toBeGreaterThan(0);

    SkillCopyMimic.blockedSkills.forEach((blockedSkill) => {
      expect(copySkills).not.toContain(blockedSkill);
    });
  });

  it('should not have any specific units', () => {
    const units = SkillCopyMimic.getUnits();
    expect(units).toEqual([]);
  });

  it('should have specific RP values', () => {
    expect(SkillCopyMimic.getRPValue(1)).toBe(600);
    expect(SkillCopyMimic.getRPValue(4)).toBe(1625);
    expect(SkillCopyMimic.getRPValue(7)).toBe(3984);
  });
});
