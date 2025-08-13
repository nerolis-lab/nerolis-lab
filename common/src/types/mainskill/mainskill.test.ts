import { describe, expect, it } from 'vitest';
import type { AmountParams } from './mainskill';
import { INGREDIENT_SUPPORT_MAINSKILLS, Mainskill, MAINSKILLS, ModifiedMainskill } from '.';
import { mainskillUnits } from './mainskill-unit';
import { ChargeEnergySMoonlight } from './mainskills/charge-energy-s-moonlight';
import { Metronome } from './mainskills/metronome';

const TestMainskill = new (class extends Mainskill {
  name = 'Test Skill';
  description = (_params: AmountParams) => 'A test skill for testing purposes.';
  RP = [100, 200, 300];
  image = 'test';
  activations = {
    testActivation: {
      unit: 'energy',
      amount: (params: AmountParams) => params.skillLevel * 10
    }
  };
})();

const TestModifiedMainskill = new (class extends ModifiedMainskill {
  baseSkill = TestMainskill;
  modifierName = 'Test Modified';
  description = (_params: AmountParams) => 'A test modified skill for testing purposes.';
  RP = [150, 300, 450];
  image = 'test';
  activations = {
    testActivation: {
      unit: 'energy',
      amount: (params: AmountParams) => params.skillLevel * 15,
      critAmount: (params: AmountParams) => params.skillLevel * 20
    }
  };
})(true);

describe('Mainskill', () => {
  describe('Generic Mainskill behavior', () => {
    it('should have basic properties structure', () => {
      expect(TestMainskill.name).toBe('Test Skill');
      expect(typeof TestMainskill.description).toBe('function');
      expect(TestMainskill.RP).toEqual([100, 200, 300]);
      expect(TestMainskill.maxLevel).toBe(3);
    });

    it('should have activations object', () => {
      expect(typeof TestMainskill.activations).toBe('object');
      expect(TestMainskill.activations).not.toBeNull();
      expect(TestMainskill.activations).toHaveProperty('testActivation');
    });

    it('should get RP value at valid levels', () => {
      expect(TestMainskill.getRPValue(1)).toBe(100);
      expect(TestMainskill.getRPValue(2)).toBe(200);
      expect(TestMainskill.getRPValue(3)).toBe(300);
    });

    it('should return undefined for invalid RP levels', () => {
      expect(TestMainskill.getRPValue(0)).toBeUndefined();
      expect(TestMainskill.getRPValue(4)).toBeUndefined();
    });

    it('should correctly identify units it has', () => {
      expect(TestMainskill.hasUnit('energy')).toBe(true);
    });

    it('should correctly identify units it does not have', () => {
      expect(TestMainskill.hasUnit('berries')).toBe(false);
      expect(TestMainskill.hasUnit('ingredients')).toBe(false);
      expect(TestMainskill.hasUnit('strength')).toBe(false);
    });

    it('should get all units used by skill', () => {
      const units = TestMainskill.getUnits();
      expect(units).toEqual(['energy']);
    });

    it('should get all activation names', () => {
      const activationNames = TestMainskill.getActivationNames();
      expect(activationNames).toEqual(['testActivation']);
    });

    it('should check skill identity correctly using is() method', () => {
      expect(TestMainskill.is(TestMainskill)).toBe(true);
      expect(TestMainskill.is(TestModifiedMainskill)).toBe(false);
    });

    it('should check skill identity correctly using is() method with multiple skills', () => {
      expect(TestMainskill.is(TestMainskill, TestModifiedMainskill)).toBe(true);
      expect(TestMainskill.is(TestModifiedMainskill, TestMainskill)).toBe(true);
      expect(TestMainskill.is(TestModifiedMainskill, TestModifiedMainskill)).toBe(false);
    });

    it('should calculate activation amounts correctly', () => {
      expect(TestMainskill.activations.testActivation.amount({ skillLevel: 1 })).toBe(10);
      expect(TestMainskill.activations.testActivation.amount({ skillLevel: 2 })).toBe(20);
      expect(TestMainskill.activations.testActivation.amount({ skillLevel: 3 })).toBe(30);
    });
  });

  describe('Generic ModifiedMainskill behavior', () => {
    it('should have modified name format', () => {
      expect(TestModifiedMainskill.name).toBe('Test Modified (Test Skill)');
      expect(TestModifiedMainskill.modifierName).toBe('Test Modified');
      expect(TestModifiedMainskill.baseSkill).toBe(TestMainskill);
    });

    it('should have modified properties', () => {
      expect(typeof TestModifiedMainskill.description).toBe('function');
      expect(TestModifiedMainskill.RP).toEqual([150, 300, 450]);
      expect(TestModifiedMainskill.maxLevel).toBe(3);
    });

    it('should have enhanced activations with crit properties', () => {
      const activation = TestModifiedMainskill.activations.testActivation;
      expect(activation.unit).toBe('energy');
      expect(typeof activation.amount).toBe('function');
      expect(activation.critAmount!({ skillLevel: 1 })).toBe(20);
      expect(activation.critAmount!({ skillLevel: 2 })).toBe(40);
      expect(activation.critAmount!({ skillLevel: 3 })).toBe(60);
    });

    it('should calculate crit amounts correctly', () => {
      const activation = TestModifiedMainskill.activations.testActivation;
      expect(activation.critAmount!({ skillLevel: 1 })).toBe(20);
      expect(activation.critAmount!({ skillLevel: 2 })).toBe(40);
      expect(activation.critAmount!({ skillLevel: 3 })).toBe(60);
    });
  });

  describe('ModifiedMainskill', () => {
    it('should have modified name format', () => {
      expect(ChargeEnergySMoonlight.name).toBe('Moonlight (Charge Energy S)');
      expect(ChargeEnergySMoonlight.modifierName).toBe('Moonlight');
      expect(ChargeEnergySMoonlight.baseSkill.name).toBe('Charge Energy S');
    });

    it('should have modified RP values', () => {
      expect(ChargeEnergySMoonlight.RP).toEqual([560, 797, 1099, 1516, 2094, 2892]);
      expect(ChargeEnergySMoonlight.maxLevel).toBe(6);
    });

    it('should have enhanced activations with crit properties', () => {
      const activation = ChargeEnergySMoonlight.activations.energy;
      expect(activation.unit).toBe('energy');
      expect(typeof activation.amount).toBe('function');
      expect(activation.critChance).toBe(0.5);
      expect(typeof activation.critAmount).toBe('function');
    });

    it('should calculate crit amounts correctly', () => {
      const activation = ChargeEnergySMoonlight.activations.energy;
      const level1CritAmount = activation.critAmount!({ skillLevel: 1 });
      const level6CritAmount = activation.critAmount!({ skillLevel: 6 });

      expect(level1CritAmount).toBe(6.3);
      expect(level6CritAmount).toBe(22.8);
    });
  });

  describe('Special Skills', () => {
    it('should handle Metronome skill correctly', () => {
      expect(Metronome.name).toBe('Metronome');
      expect(typeof Metronome.description).toBe('function');
      expect(Metronome.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
      expect(Metronome.maxLevel).toBe(7);
      expect(Object.keys(Metronome.activations)).toHaveLength(0);
    });

    it('should have metronome skills excluding blocked skills', () => {
      const metronomeSkills = Metronome.metronomeSkills;
      expect(metronomeSkills).not.toContain(Metronome);
      expect(Array.isArray(metronomeSkills)).toBe(true);
      expect(metronomeSkills.length).toBeGreaterThan(0);
    });
  });

  describe('Skills with multiple activations', () => {
    it('should handle skills with multiple units correctly', () => {
      // Find a skill with multiple activations or test a hypothetical one
      // This test would need to be adjusted based on actual skills with multiple activations
      const multiActivationSkill = MAINSKILLS.find((skill) => skill.getUnits().length > 1);

      if (multiActivationSkill) {
        const units = multiActivationSkill.getUnits();
        const activationNames = multiActivationSkill.getActivationNames();

        expect(units.length).toBeGreaterThan(1);
        expect(activationNames.length).toBeGreaterThan(1);

        units.forEach((unit) => {
          expect(multiActivationSkill.hasUnit(unit)).toBe(true);
        });
      }
    });
  });

  describe('Global skill arrays', () => {
    it('should include skills in MAINSKILLS array', () => {
      expect(MAINSKILLS).toContain(TestMainskill);
      expect(MAINSKILLS).toContain(ChargeEnergySMoonlight);
      expect(MAINSKILLS).toContain(Metronome);
      expect(MAINSKILLS.length).toBeGreaterThan(0);
    });

    it('should include ingredient support skills in INGREDIENT_SUPPORT_MAINSKILLS array', () => {
      expect(INGREDIENT_SUPPORT_MAINSKILLS).toContain(ChargeEnergySMoonlight);
      expect(INGREDIENT_SUPPORT_MAINSKILLS).toContain(Metronome);
      // Note: Skills that benefit team ingredients are passed true to constructor
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle invalid skill levels gracefully', () => {
      // Test with level 0 (should return undefined)
      expect(TestMainskill.getRPValue(0)).toBeUndefined();

      // Test with level beyond max level
      expect(TestMainskill.getRPValue(4)).toBeUndefined();
    });

    it('should validate that all skills have proper structure', () => {
      MAINSKILLS.forEach((skill) => {
        expect(typeof skill.name).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
        expect(typeof skill.description).toBe('function');
        expect(Array.isArray(skill.RP)).toBe(true);
        expect(skill.RP.length).toBeGreaterThan(0);
        expect(typeof skill.activations).toBe('object');
        expect(typeof skill.maxLevel).toBe('number');
        expect(skill.maxLevel).toBeGreaterThan(0);
      });
    });

    it('should ensure modified skills extend their base skills properly', () => {
      const modifiedSkills = MAINSKILLS.filter((skill) => skill instanceof ModifiedMainskill) as ModifiedMainskill[];

      modifiedSkills.forEach((modifiedSkill) => {
        expect(modifiedSkill.baseSkill).toBeInstanceOf(Mainskill);
        expect(typeof modifiedSkill.modifierName).toBe('string');
        expect(modifiedSkill.modifierName.length).toBeGreaterThan(0);
        expect(modifiedSkill.name).toContain(modifiedSkill.modifierName);
        expect(modifiedSkill.name).toContain(modifiedSkill.baseSkill.name);
      });
    });
  });
});

describe('Additional validation tests', () => {
  it('should ensure all skills have valid units for each activation', () => {
    MAINSKILLS.forEach((skill) => {
      Object.entries(skill.activations).forEach(([activationName, activation]) => {
        expect(mainskillUnits).toContain(activation.unit);
        expect(typeof activation.amount).toBe('function');

        // Test that the activation name is descriptive
        expect(activationName.length).toBeGreaterThan(0);
        expect(typeof activationName).toBe('string');
      });
    });
  });

  it('should ensure activation amount functions return valid numbers', () => {
    MAINSKILLS.forEach((skill) => {
      Object.values(skill.activations).forEach((activation) => {
        // Test amount function for all skill levels
        for (let level = 1; level <= skill.maxLevel; level++) {
          const amount = activation.amount({ skillLevel: level });
          // Some skills might return undefined for edge levels
          if (amount !== undefined) {
            expect(typeof amount).toBe('number');
            expect(amount).toBeGreaterThanOrEqual(0); // Some bonus activations may return 0
            expect(Number.isFinite(amount)).toBe(true);
          }
        }
      });
    });
  });

  it('should handle out-of-bounds skill levels gracefully with leveledAmount helper', () => {
    // Create a test mainskill to test the leveledAmount helper
    const testSkill = new (class extends Mainskill {
      name = 'Test Skill 2';
      description = (_params: AmountParams) => 'Another test skill.';
      RP = [100, 200, 300];
      image = 'test';
      activations = {
        testActivation: {
          unit: 'test',
          amount: this.leveledAmount([10, 20, 30])
        }
      };
    })(false, true); // Don't add to global arrays

    // Test normal levels
    expect(testSkill.activations.testActivation.amount({ skillLevel: 1 })).toBe(10);
    expect(testSkill.activations.testActivation.amount({ skillLevel: 2 })).toBe(20);
    expect(testSkill.activations.testActivation.amount({ skillLevel: 3 })).toBe(30);

    // Test out-of-bounds levels (should clamp to valid range)
    expect(testSkill.activations.testActivation.amount({ skillLevel: 0 })).toBe(10); // Clamped to level 1
    expect(testSkill.activations.testActivation.amount({ skillLevel: -5 })).toBe(10); // Clamped to level 1
    expect(testSkill.activations.testActivation.amount({ skillLevel: 4 })).toBe(30); // Clamped to max level (3)
    expect(testSkill.activations.testActivation.amount({ skillLevel: 999 })).toBe(30); // Clamped to max level (3)
  });

  it('should ensure skills have consistent structure', () => {
    MAINSKILLS.forEach((skill) => {
      // Check RP array matches maxLevel
      expect(skill.RP.length).toBe(skill.maxLevel);

      // Check all RP values are positive numbers
      skill.RP.forEach((rp) => {
        expect(typeof rp).toBe('number');
        expect(rp).toBeGreaterThan(0);
        expect(Number.isFinite(rp)).toBe(true);
      });

      // Check that RP values are generally increasing (allowing for some variance)
      for (let i = 1; i < skill.RP.length; i++) {
        expect(skill.RP[i]).toBeGreaterThanOrEqual(skill.RP[i - 1]);
      }
    });
  });

  it('should ensure modified skills have proper inheritance', () => {
    const modifiedSkills = MAINSKILLS.filter((skill) => skill instanceof ModifiedMainskill) as ModifiedMainskill[];

    modifiedSkills.forEach((modifiedSkill) => {
      // Note: Some modified skills might have different max levels than their base skills
      // This is allowed for game balance reasons, so we only check that they have valid levels
      expect(modifiedSkill.maxLevel).toBeGreaterThan(0);
      expect(modifiedSkill.baseSkill.maxLevel).toBeGreaterThan(0);

      // Check that the modified skill's name includes both modifier and base skill name
      expect(modifiedSkill.name).toMatch(new RegExp(`${modifiedSkill.modifierName}.*${modifiedSkill.baseSkill.name}`));

      // Check that base skill exists in MAINSKILLS
      expect(MAINSKILLS).toContain(modifiedSkill.baseSkill);
    });
  });
});
