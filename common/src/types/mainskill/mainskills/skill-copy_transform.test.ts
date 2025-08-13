import { describe, expect, it } from 'vitest';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';
import { SkillCopy } from './skill-copy';
import { SkillCopyTransform } from './skill-copy_transform';

describe('SkillCopyTransform', () => {
  it('should have modified name format', () => {
    expect(SkillCopyTransform.name).toBe('Transform (Skill Copy)');
    expect(SkillCopyTransform.modifierName).toBe('Transform');
    expect(SkillCopyTransform.baseSkill).toBe(SkillCopy);
  });

  it('should have correct basic properties', () => {
    expect(SkillCopyTransform.name).toBe('Transform (Skill Copy)');
    expect(SkillCopyTransform.description({ skillLevel: 1 })).toBe(
      'Copies and performs the main skill of one randomly selected Pokémon on the team.'
    );
    expect(SkillCopyTransform.RP).toEqual([600, 853, 1177, 1625, 2243, 3099, 3984]);
    expect(SkillCopyTransform.maxLevel).toBe(7);
  });

  it('should have empty activations object', () => {
    expect(Object.keys(SkillCopyTransform.activations)).toHaveLength(0);
  });

  it('should have blocked skills list', () => {
    expect(Array.isArray(SkillCopyTransform.blockedSkills)).toBe(true);
    expect(SkillCopyTransform.blockedSkills).toContain(SkillCopyTransform);
    expect(SkillCopyTransform.blockedSkills).toContain(ChargeStrengthMBadDreams);
    expect(SkillCopyTransform.blockedSkills).toContain(BerryBurstDisguise);
  });

  it('should have copy skills excluding blocked skills', () => {
    const copySkills = SkillCopyTransform.copySkills;
    expect(Array.isArray(copySkills)).toBe(true);
    expect(copySkills.length).toBeGreaterThan(0);

    SkillCopyTransform.blockedSkills.forEach((blockedSkill) => {
      expect(copySkills).not.toContain(blockedSkill);
    });
  });

  it('should not have any specific units', () => {
    const units = SkillCopyTransform.getUnits();
    expect(units).toEqual([]);
  });

  it('should have specific RP values', () => {
    expect(SkillCopyTransform.getRPValue(1)).toBe(600);
    expect(SkillCopyTransform.getRPValue(4)).toBe(1625);
    expect(SkillCopyTransform.getRPValue(7)).toBe(3984);
  });
});
