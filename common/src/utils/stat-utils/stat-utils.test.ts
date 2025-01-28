import { describe, expect, it } from 'vitest';
import { BRAVE, MILD, SASSY } from '../../domain/nature';
import {
  ABSOL,
  CATERPIE,
  CHARIZARD,
  DEDENNE,
  DRAGONITE,
  FLAREON,
  GALLADE,
  GLACEON,
  LEAFEON,
  MAGNEZONE,
  PIKACHU_HOLIDAY,
  RAICHU,
  RAIKOU,
  SYLVEON,
  TOGEKISS
} from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  ENERGY_RECOVERY_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  INVENTORY_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../../domain/subskill/subskills';
import {
  calculateHelpSpeedSubskills,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculatePityProcThreshold,
  calculateRibbonCarrySize,
  calculateRibbonFrequency,
  calculateSkillPercentage,
  calculateSkillPercentageWithPityProc,
  calculateSubskillCarrySize,
  countErbUsers,
  extractIngredientSubskills,
  extractTriggerSubskills
} from '../../utils/stat-utils/stat-utils';
import { mockPokemon } from '../../vitest/mocks';

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage', () => {
    const result = calculateIngredientPercentage({
      pokemon: { ...mockPokemon(), ingredientPercentage: 20 },
      nature: MILD,
      subskills: new Set([INGREDIENT_FINDER_M.name, INGREDIENT_FINDER_S.name])
    });

    expect(result).toBe(0.3696);
  });
});

describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage', () => {
    const result = calculateSkillPercentage(
      SYLVEON.skillPercentage,
      new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]),
      SASSY
    );

    expect(result).toBe(0.07392);
  });
});

describe('calculateSkillPercentageWithPityProc', () => {
  it('shall calculate skill percentage with subskills and nature', () => {
    const result = calculateSkillPercentageWithPityProc(
      SYLVEON,
      new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]),
      SASSY
    );

    expect(result).toBe(0.07493626822619681);
  });

  it('shall calculate Raikou', () => {
    const result = calculateSkillPercentage(RAIKOU.skillPercentage, new Set(), BRAVE);
    expect(result).toMatchInlineSnapshot(`0.019`);
    const result2 = calculateSkillPercentageWithPityProc(RAIKOU, new Set(), BRAVE);
    expect(result2).toMatchInlineSnapshot(`0.0258916072626962`);
  });
});

describe('calculatePityProcThreshold', () => {
  it('shall calculate correct threshold for skill Pokemon', () => {
    expect(calculatePityProcThreshold(GALLADE)).toBe(60);
    expect(calculatePityProcThreshold(SYLVEON)).toBe(55);
    expect(calculatePityProcThreshold(DEDENNE)).toBe(57);
    expect(calculatePityProcThreshold(PIKACHU_HOLIDAY)).toBe(57);
    expect(calculatePityProcThreshold(GLACEON)).toBe(45);
    expect(calculatePityProcThreshold(LEAFEON)).toBe(48);
    expect(calculatePityProcThreshold(TOGEKISS)).toBe(55);
    expect(calculatePityProcThreshold(MAGNEZONE)).toBe(46);
    expect(calculatePityProcThreshold(FLAREON)).toBe(53);
    expect(calculatePityProcThreshold(RAIKOU)).toBe(68);
  });

  it('shall calculate correct threshold for berry and ingredient pokemon', () => {
    expect(calculatePityProcThreshold(RAICHU)).toBe(78);
    expect(calculatePityProcThreshold(CATERPIE)).toBe(78);
    expect(calculatePityProcThreshold(CHARIZARD)).toBe(78);
    expect(calculatePityProcThreshold(DRAGONITE)).toBe(78);
    expect(calculatePityProcThreshold(ABSOL)).toBe(78);
  });
});

describe('extractIngredientSubskills', () => {
  it('shall calculate default ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set())).toBe(1);
  });
  it('shall calculate ingM+ingS ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_M.name, INGREDIENT_FINDER_S.name]))).toBe(1.54);
  });
  it('shall calculate ingM ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_M.name]))).toBe(1.36);
  });
  it('shall calculate ingS ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_S.name]))).toBe(1.18);
  });
});

describe('extractTriggerSubskills', () => {
  it('shall calculate default trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set())).toBe(1);
  });
  it('shall calculate triggerM+triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]))).toBe(1.54);
  });
  it('shall calculate triggerM trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_M.name]))).toBe(1.36);
  });
  it('shall calculate triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_S.name]))).toBe(1.18);
  });
});

describe('calculateNrOfBerriesPerDrop', () => {
  it('shall give 2 berries for berry specialty', () => {
    expect(calculateNrOfBerriesPerDrop('berry', new Set())).toBe(2);
  });

  it('shall give 3 berries for berry specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop('berry', new Set([BERRY_FINDING_S.name]))).toBe(3);
  });

  it('shall give 1 berry for ingredient specialty', () => {
    expect(calculateNrOfBerriesPerDrop('ingredient', new Set())).toBe(1);
  });

  it('shall give 2 berries for skill specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop('skill', new Set([BERRY_FINDING_S.name]))).toBe(2);
  });
});

describe('countErbUsers', () => {
  it('shall clamp to 5 when user adds erb to both own and 5 members', () => {
    expect(countErbUsers(5, new Set([ENERGY_RECOVERY_BONUS.name]))).toBe(5);
  });

  it('shall clamp to 0 when team erb is negative', () => {
    expect(countErbUsers(-1, new Set())).toBe(0);
  });

  it('shall add user erb and team members erb', () => {
    expect(countErbUsers(2, new Set([ENERGY_RECOVERY_BONUS.name]))).toBe(3);
  });
});

describe('calculateHelpSpeedSubskills', () => {
  it('shall calculate default helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills({ subskills: new Set(), nrOfTeamHelpingBonus: 0 })).toBe(1);
  });
  it('shall calculate helpM+helpS helpSpeed factor from subskills', () => {
    expect(
      calculateHelpSpeedSubskills({
        subskills: new Set([HELPING_SPEED_M.name, HELPING_SPEED_S.name]),
        nrOfTeamHelpingBonus: 0
      })
    ).toBe(0.79);
  });
  it('shall calculate helpM helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills({ subskills: new Set([HELPING_SPEED_M.name]), nrOfTeamHelpingBonus: 0 })).toBe(
      0.86
    );
  });
  it('shall calculate helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills({ subskills: new Set([HELPING_SPEED_S.name]), nrOfTeamHelpingBonus: 0 })).toBe(
      0.93
    );
  });
  it('shall calculate and clamp helpS helpSpeed factor from subskills', () => {
    expect(
      calculateHelpSpeedSubskills({
        subskills: new Set([HELPING_SPEED_S.name, HELPING_SPEED_M.name]),
        nrOfTeamHelpingBonus: 3
      })
    ).toBe(0.65);
  });
  it('shall calculate and clamp helping bonus if user and team exceeds 5', () => {
    expect(calculateHelpSpeedSubskills({ subskills: new Set([HELPING_BONUS.name]), nrOfTeamHelpingBonus: 5 })).toBe(
      0.75
    );
  });
});

describe('extractInventorySubskills', () => {
  it('shall calculate default inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set())).toBe(0);
  });
  it('shall calculate invS+invM+invL inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set([INVENTORY_S.name, INVENTORY_M.name, INVENTORY_L.name]))).toBe(36);
  });
  it('shall calculate invM+invL inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set([INVENTORY_M.name, INVENTORY_L.name]))).toBe(30);
  });
  it('shall calculate invS inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set([INVENTORY_S.name]))).toBe(6);
  });
});

describe('calculateRibbonFrequency', () => {
  it('shall calculate ribbon frequency for different ribbon levels', () => {
    const pokemon = { ...mockPokemon(), remainingEvolutions: 1 };
    expect(calculateRibbonFrequency(pokemon, 1)).toBe(1);
    expect(calculateRibbonFrequency(pokemon, 2)).toBe(0.95);
    expect(calculateRibbonFrequency(pokemon, 4)).toBeCloseTo(0.88);
  });

  it('shall calculate ribbon frequency for different ribbon levels with 2 evolutions', () => {
    const pokemon = { ...mockPokemon(), remainingEvolutions: 2 };
    expect(calculateRibbonFrequency(pokemon, 1)).toBe(1);
    expect(calculateRibbonFrequency(pokemon, 2)).toBe(0.89);
    expect(calculateRibbonFrequency(pokemon, 4)).toBe(0.75);
  });
});

describe('calculateRibbonCarrySize', () => {
  it('shall calculate carry size based on ribbon level', () => {
    expect(calculateRibbonCarrySize(0)).toBe(0);
    expect(calculateRibbonCarrySize(1)).toBe(1);
    expect(calculateRibbonCarrySize(2)).toBe(3);
    expect(calculateRibbonCarrySize(3)).toBe(6);
    expect(calculateRibbonCarrySize(4)).toBe(8);
  });
});
