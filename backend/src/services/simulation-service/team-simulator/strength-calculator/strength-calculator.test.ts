import { StrengthCalculator } from '@src/services/simulation-service/team-simulator/strength-calculator/strength-calculator.js';
import { mocks } from '@src/vitest/index.js';
import { berry, berryPowerForLevel, mainskillUnits, type MemberSkillValue } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('StrengthCalculator', () => {
  const calculator = new StrengthCalculator();

  it('shall calculate berry strength with favored and island bonuses', () => {
    const settings = mocks.teamSettingsExt({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 15
      })
    });

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: {
        berries: [
          { berry: berry.BELUE, level: 60, amount: 10 },
          { berry: berry.CHERI, level: 30, amount: 5 }
        ],
        ingredients: []
      },
      produceFromSkill: { berries: [], ingredients: [] },
      skillValue: emptySkillValue()
    });

    const belueBase = 10 * berryPowerForLevel(berry.BELUE, 60);
    const belueFavored = belueBase; // favored berries have 2x multiplier
    const belueIsland = (belueBase + belueFavored) * 0.15;

    const cheriBase = 5 * berryPowerForLevel(berry.CHERI, 30);
    const cheriIsland = cheriBase * 0.15;

    expect(result.berries.breakdown).toEqual({
      base: Math.floor(belueBase + cheriBase),
      favored: Math.floor(belueFavored),
      islandBonus: Math.floor(belueIsland + cheriIsland)
    });
    expect(result.berries.total).toBe(Math.floor(belueBase + belueFavored + belueIsland + cheriBase + cheriIsland));
    expect(result.skill.total).toBe(0);
  });

  it('shall calculate skill strength including skill berries and strength value', () => {
    const settings = mocks.teamSettingsExt({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 20
      })
    });

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: { berries: [], ingredients: [] },
      produceFromSkill: {
        berries: [
          { berry: berry.BELUE, amount: 4, level: 60 },
          { berry: berry.PECHA, amount: 2, level: 30 }
        ],
        ingredients: []
      },
      skillValue: (() => {
        const skillValues = emptySkillValue();
        skillValues.strength = { amountToSelf: 100, amountToTeam: 50 };
        return skillValues;
      })()
    });

    const belueBase = 4 * berryPowerForLevel(berry.BELUE, 60);
    const belueFavored = belueBase;
    const belueIsland = (belueBase + belueFavored) * 0.2;

    const pechaBase = 2 * berryPowerForLevel(berry.PECHA, 30);
    const pechaIsland = pechaBase * 0.2;

    const skillBase = 150;
    const skillIsland = skillBase * 0.2;

    expect(result.berries.total).toBe(0);
    expect(result.skill.breakdown.base).toBe(Math.floor(belueBase + belueFavored + pechaBase + skillBase));
    expect(result.skill.breakdown.islandBonus).toBe(Math.floor(belueIsland + pechaIsland + skillIsland));
    expect(result.skill.total).toBe(
      Math.floor(belueBase + belueFavored + pechaBase + skillBase + belueIsland + pechaIsland + skillIsland)
    );
  });

  it('shall fall back to settings area bonus when not provided', () => {
    const settings = mocks.teamSettingsExt({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 10
      })
    });

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: {
        berries: [{ berry: berry.BELUE, amount: 1, level: 1 }],
        ingredients: []
      },
      produceFromSkill: { berries: [], ingredients: [] },
      skillValue: emptySkillValue()
    });

    const base = berryPowerForLevel(berry.BELUE, 1);
    const favored = base;
    const island = (base + favored) * 0.1;

    expect(result.berries.total).toBe(Math.floor(base + favored + island));
  });
});

function emptySkillValue(): MemberSkillValue {
  const value = {} as MemberSkillValue;
  for (const unit of mainskillUnits) {
    value[unit] = { amountToSelf: 0, amountToTeam: 0 };
  }
  return value;
}
