import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator.js';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet, PokemonWithIngredients, TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import {
  berry,
  ChargeStrengthM,
  ChargeStrengthS,
  commonMocks,
  emptyIngredientInventoryFloat,
  ingredient,
  MAX_POT_SIZE,
  Metronome,
  nature,
  subskill
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

const mockPokemonSet: PokemonWithIngredients = {
  pokemon: commonMocks.mockPokemon({
    carrySize: 10,
    frequency: 3600,
    ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredientPercentage: 20,
    skill: ChargeStrengthS,
    skillPercentage: 2,
    specialty: 'skill'
  }),
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};

const guaranteedSkillProcMember: TeamMemberExt = {
  pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
  settings: {
    carrySize: 10,
    level: 60,
    ribbon: 0,
    nature: nature.BASHFUL,
    skillLevel: 6,
    subskills: new Set(),
    externalId: 'some id'
  }
};

const member: TeamMemberExt = {
  pokemonWithIngredients: mockPokemonSet,
  settings: {
    carrySize: 10,
    level: 60,
    ribbon: 0,
    nature: nature.BASHFUL,
    skillLevel: 6,
    subskills: new Set(),
    externalId: 'some id'
  }
};

const settings: TeamSettingsExt = {
  bedtime: TimeUtils.parseTime('21:30'),
  wakeup: TimeUtils.parseTime('06:00'),
  camp: false,
  includeCooking: true,
  stockpiledIngredients: emptyIngredientInventoryFloat(),
  potSize: MAX_POT_SIZE
};

const cookingState: CookingState = new CookingState(settings, defaultUserRecipes(), createPreGeneratedRandom());

describe('results', () => {
  it('should return correct results after multiple iterations', () => {
    const memberState = new MemberState({ member: guaranteedSkillProcMember, settings, team: [member], cookingState });
    for (let i = 0; i < 100; i++) {
      memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
      memberState.collectInventory();
    }
    const results = memberState.results(10);

    expect(results.produceTotal.berries.length).toBeGreaterThan(0);
    expect(results.produceTotal.ingredients.length).toBeGreaterThan(0);
    expect(results.skillProcs).toBe(10);
  });

  it('should return zero results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    const results = memberState.results(10);

    expect(results.produceTotal.berries.length).toBe(0);
    expect(results.produceTotal.ingredients.length).toBe(0);
    expect(results.skillAmount).toBe(0);
    expect(results.skillProcs).toBe(0);
  });
});

describe('simpleResults', () => {
  it('should return correct simple results', () => {
    const memberState = new MemberState({ member: guaranteedSkillProcMember, settings, team: [member], cookingState });
    memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
    memberState.collectInventory();
    const simpleResults = memberState.simpleResults(10);

    expect(simpleResults.skillProcs).toBe(0.1);
    expect(simpleResults.totalHelps).toBe(0.1);
  });

  it('should return zero simple results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });

    const simpleResults = memberState.simpleResults(10);

    expect(simpleResults.skillProcs).toBe(0);
    expect(simpleResults.totalHelps).toBe(0);
  });
});

describe('ivResults', () => {
  it('should return correct iv results', () => {
    const ingredientList: IngredientSet[] = [{ amount: 10, ingredient: ingredient.FANCY_APPLE }];

    // this member has 2 berries per drop and 10 apples per drop, 50% ing% gives average of 1 berry and 5 apples
    const memberState = new MemberState({
      member: {
        ...guaranteedSkillProcMember,
        pokemonWithIngredients: {
          pokemon: commonMocks.mockPokemon({
            specialty: 'berry',
            ingredientPercentage: 50,
            skillPercentage: 100,
            skill: ChargeStrengthM
          }),
          ingredientList
        },
        settings: { ...guaranteedSkillProcMember.settings, level: 1 }
      },
      settings,
      team: [member],
      cookingState
    });
    for (let i = 0; i < 100; i++) {
      memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
      memberState.collectInventory();
    }
    const ivResults = memberState.ivResults(10);

    // we have had 1 help so total should be 1 berry and 5 apples
    // we then divide by 10 since we ran result for 10 days
    expect(ivResults.produceTotal.berries).toHaveLength(1);
    expect(ivResults.produceTotal.berries[0].amount).toBeCloseTo(10.6); // approximately 10

    expect(ivResults.produceTotal.ingredients).toHaveLength(1);
    expect(ivResults.produceTotal.ingredients[0].amount).toBe(47); // approximately 50

    expect(ivResults.skillProcs).toBeGreaterThan(0);
  });

  it('should return zero iv results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    const ivResults = memberState.ivResults(10);

    expect(ivResults.produceTotal.berries.length).toBe(0);
    expect(ivResults.produceTotal.ingredients.length).toBe(0);
    expect(ivResults.skillProcs).toBe(0);
  });
});

describe('MemberState init', () => {
  const memberState = new MemberState({ member, settings, team: [member], cookingState });

  it('shall return expected team size', () => {
    expect(memberState.teamSize).toBe(1);
  });

  it('shall return expected berry', () => {
    expect(memberState.berry).toBe(berry.BELUE);
  });

  it('shall return expected inventory limit', () => {
    expect(memberState.inventoryLimit).toBe(10);
  });

  it('shall return expected energy', () => {
    expect(memberState.energy).toBe(0);
  });
});

describe('startDay', () => {
  it('shall recover full sleep', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover less than full sleep if energy- nature', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(88);
  });

  it('shall recover less than full sleep if sleeping short', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };

    const settings: TeamSettingsExt = mocks.teamSettingsExt({ bedtime: TimeUtils.parseTime('23:30') });

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(Math.round(memberState.energy)).toBe(67);
  });

  it('shall recover max up to 100 if member has residual energy from day before', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50, memberState);
    expect(memberState.energy).toBe(50);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(Math.round(memberState.energy)).toBe(100);
  });

  it('shall recover to 100 despite energy- nature if teammate has erb', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };
    const teammate: TeamMemberExt = {
      ...member,
      settings: {
        ...member.settings,
        subskills: new Set([subskill.ENERGY_RECOVERY_BONUS.name])
      }
    };

    const memberState = new MemberState({ member, settings, team: [member, teammate], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover to 105 if member has erb', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set([subskill.ENERGY_RECOVERY_BONUS.name]),
        externalId: 'some id'
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(105);
  });
});

describe('recoverEnergy', () => {
  it('shall recover energy from e4e', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(18, memberState);
    expect(memberState.energy).toBe(18);
    memberState.recoverEnergy(18, memberState);
    expect(memberState.energy).toBe(36);
  });

  it('shall recover less energy with energy- nature', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50, memberState);
    expect(memberState.energy).toBe(44);
  });

  it('shall recover max 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(200, memberState);
    expect(memberState.energy).toBe(150);
    memberState.recoverEnergy(10, memberState);
    expect(memberState.energy).toBe(150);
  });
});

describe('addHelps', () => {
  it('shall add 1 average produce help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelps({ regular: 1, crit: 1 }, memberState);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "averageHelps": 2,
          "berryProductionDistribution": {
            "2": 100,
          },
          "carrySize": 10,
          "dayHelps": 2,
          "dayPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "frequencySplit": {
            "eighty": 0,
            "fourty": 0,
            "one": 0,
            "sixty": 0,
            "zero": 0,
          },
          "ingredientDistributions": {
            "Tail": {
              "0": 100,
            },
          },
          "ingredientPercentage": 0.2,
          "maxFrequency": 1428.75,
          "morningProcs": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "nightPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "skillCritValue": 0,
          "skillCrits": 0,
          "skillPercentage": 0.02,
          "skillProcDistribution": {},
          "skillRegularValue": 0,
          "sneakySnack": {
            "amount": 0,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
          "teamSupport": {
            "energy": 0,
            "helps": 0,
          },
          "totalHelps": 2,
          "totalRecovery": 0,
          "wastedEnergy": 0,
        },
        "externalId": "some id",
        "pokemonWithIngredients": {
          "ingredients": Int16Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3,
          ],
          "pokemon": "MOCKEMON",
        },
        "produceFromSkill": {
          "berries": [],
          "ingredients": [],
        },
        "produceTotal": {
          "berries": [
            {
              "amount": 2,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "produceWithoutSkill": {
          "berries": [
            {
              "amount": 2,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "skillAmount": 0,
        "skillProcs": 0,
        "skillValue": {},
      }
    `);
  });

  it('shall not add produce if adding 0 helps', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelps({ regular: 0, crit: 0 }, memberState);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "averageHelps": 0,
          "berryProductionDistribution": {
            "0": 100,
          },
          "carrySize": 10,
          "dayHelps": 0,
          "dayPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "frequencySplit": {
            "eighty": NaN,
            "fourty": NaN,
            "one": NaN,
            "sixty": NaN,
            "zero": NaN,
          },
          "ingredientDistributions": {
            "Tail": {
              "0": 100,
            },
          },
          "ingredientPercentage": 0.2,
          "maxFrequency": 1428.75,
          "morningProcs": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "nightPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "skillCritValue": 0,
          "skillCrits": 0,
          "skillPercentage": 0.02,
          "skillProcDistribution": {},
          "skillRegularValue": 0,
          "sneakySnack": {
            "amount": 0,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
          "teamSupport": {
            "energy": 0,
            "helps": 0,
          },
          "totalHelps": 0,
          "totalRecovery": 0,
          "wastedEnergy": 0,
        },
        "externalId": "some id",
        "pokemonWithIngredients": {
          "ingredients": Int16Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3,
          ],
          "pokemon": "MOCKEMON",
        },
        "produceFromSkill": {
          "berries": [],
          "ingredients": [],
        },
        "produceTotal": {
          "berries": [],
          "ingredients": [],
        },
        "produceWithoutSkill": {
          "berries": [
            {
              "amount": 0,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "skillAmount": 0,
        "skillProcs": 0,
        "skillValue": {},
      }
    `);
  });
});

describe('recoverMeal', () => {
  it('shall recover energy from cooking', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(5);
  });

  it('shall recover no energy from cooking at 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(150, memberState);
    expect(memberState.energy).toBe(150);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(150);
  });
});

describe('attemptDayHelp', () => {
  it('shall perform a help if time surpasses scheduled help time', () => {
    const settings: TeamSettingsExt = mocks.teamSettingsExt({ bedtime: TimeUtils.parseTime('23:30') });

    const member: TeamMemberExt = {
      pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 0 } },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "averageHelps": 1,
          "berryProductionDistribution": {
            "1": 100,
          },
          "carrySize": 10,
          "dayHelps": 1,
          "dayPeriod": {
            "averageEnergy": 0.3641456582633053,
            "averageFrequency": 7.8619047619047615,
            "spilledIngredients": [],
          },
          "frequencySplit": {
            "eighty": 0,
            "fourty": 0,
            "one": 0,
            "sixty": 1,
            "zero": 0,
          },
          "ingredientDistributions": {
            "Tail": {
              "0": 100,
            },
          },
          "ingredientPercentage": 0.2,
          "maxFrequency": 1428.75,
          "morningProcs": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "nightPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "skillCritValue": 0,
          "skillCrits": 0,
          "skillPercentage": 0,
          "skillProcDistribution": {},
          "skillRegularValue": 0,
          "sneakySnack": {
            "amount": 0,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
          "teamSupport": {
            "energy": 0,
            "helps": 0,
          },
          "totalHelps": 1,
          "totalRecovery": 0,
          "wastedEnergy": 0,
        },
        "externalId": "some id",
        "pokemonWithIngredients": {
          "ingredients": Int16Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3,
          ],
          "pokemon": "MOCKEMON",
        },
        "produceFromSkill": {
          "berries": [],
          "ingredients": [],
        },
        "produceTotal": {
          "berries": [
            {
              "amount": 1,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "produceWithoutSkill": {
          "berries": [
            {
              "amount": 1,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "skillAmount": 0,
        "skillProcs": 0,
        "skillValue": {},
      }
    `);
  });

  it('shall not perform a help if time has not passed scheduled help time', () => {
    const settings: TeamSettingsExt = mocks.teamSettingsExt({ bedtime: TimeUtils.parseTime('23:30') });

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(-1);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "averageHelps": 0,
          "berryProductionDistribution": {
            "0": 100,
          },
          "carrySize": 10,
          "dayHelps": 0,
          "dayPeriod": {
            "averageEnergy": 0.3641456582633053,
            "averageFrequency": 7.8619047619047615,
            "spilledIngredients": [],
          },
          "frequencySplit": {
            "eighty": NaN,
            "fourty": NaN,
            "one": NaN,
            "sixty": Infinity,
            "zero": NaN,
          },
          "ingredientDistributions": {
            "Tail": {
              "0": 100,
            },
          },
          "ingredientPercentage": 0.2,
          "maxFrequency": 1428.75,
          "morningProcs": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "nightPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "skillCritValue": 0,
          "skillCrits": 0,
          "skillPercentage": 0.02,
          "skillProcDistribution": {},
          "skillRegularValue": 0,
          "sneakySnack": {
            "amount": 0,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
          "teamSupport": {
            "energy": 0,
            "helps": 0,
          },
          "totalHelps": 0,
          "totalRecovery": 0,
          "wastedEnergy": 0,
        },
        "externalId": "some id",
        "pokemonWithIngredients": {
          "ingredients": Int16Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3,
          ],
          "pokemon": "MOCKEMON",
        },
        "produceFromSkill": {
          "berries": [],
          "ingredients": [],
        },
        "produceTotal": {
          "berries": [],
          "ingredients": [],
        },
        "produceWithoutSkill": {
          "berries": [
            {
              "amount": 0,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "skillAmount": 0,
        "skillProcs": 0,
        "skillValue": {},
      }
    `);
  });

  it('shall schedule the next help', () => {
    const settings: TeamSettingsExt = mocks.teamSettingsExt();

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);
    memberState.scheduleHelp(0);

    expect(memberState.results(1).advanced.totalHelps).toEqual(1);

    const frequencyBeforeEnergy = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      teamHelpingBonus: 0
    });
    const frequency = calculateFrequencyWithEnergy(frequencyBeforeEnergy, memberState.energy);
    const nextHelp = frequency / 60;

    const justBeforeNextHelp = nextHelp - 1;

    memberState.attemptDayHelp(justBeforeNextHelp);
    expect(memberState.results(1).advanced.totalHelps).toEqual(1);

    memberState.attemptDayHelp(nextHelp);
    expect(memberState.results(1).advanced.totalHelps).toEqual(2);
  });

  it('shall attempt and proc skill', () => {
    const memberState = new MemberState({
      member: guaranteedSkillProcMember,
      settings,
      team: [guaranteedSkillProcMember],
      cookingState
    });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });

  it('shall still count metronome proc as 1 proc', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: Metronome }
      },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    // fill inv
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });
});

describe('attemptNightHelp', () => {
  it('shall not perform night help if the time has not passed scheduled time', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(-1);

    expect(memberState.results(1).advanced.totalHelps).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(0);
  });

  it('shall add 1 night help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);

    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
  });

  it('shall add any excess helps to sneaky snacking, and shall not roll skill proc on those', () => {
    const noCarryMember: TeamMemberExt = { ...member, settings: { ...member.settings, carrySize: 0 } };
    const memberState = new MemberState({ member: noCarryMember, settings, team: [noCarryMember], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1).skillProcs).toEqual(0);
    expect(memberState.results(1).produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0)).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
    expect(memberState.results(1).advanced.totalHelps).toEqual(1);
  });

  it('shall roll skill proc on helps before inventory full at night, upon collecting in the morning', () => {
    const member: TeamMemberExt = {
      pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id'
      }
    };
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "averageHelps": 1,
          "berryProductionDistribution": {
            "1": 100,
          },
          "carrySize": 10,
          "dayHelps": 0,
          "dayPeriod": {
            "averageEnergy": 0,
            "averageFrequency": 0,
            "spilledIngredients": [],
          },
          "frequencySplit": {
            "eighty": 1,
            "fourty": 0,
            "one": 0,
            "sixty": 0,
            "zero": 0,
          },
          "ingredientDistributions": {
            "Tail": {
              "0": 100,
            },
          },
          "ingredientPercentage": 0.2,
          "maxFrequency": 1428.75,
          "morningProcs": 1,
          "nightHelps": 1,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 1,
          "nightPeriod": {
            "averageEnergy": 0.9803921568627451,
            "averageFrequency": 14.007352941176471,
            "spilledIngredients": [],
          },
          "skillCritValue": 0,
          "skillCrits": 0,
          "skillPercentage": 1,
          "skillProcDistribution": {},
          "skillRegularValue": 2066,
          "sneakySnack": {
            "amount": 0,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
          "teamSupport": {
            "energy": 0,
            "helps": 0,
          },
          "totalHelps": 1,
          "totalRecovery": 0,
          "wastedEnergy": 0,
        },
        "externalId": "some id",
        "pokemonWithIngredients": {
          "ingredients": Int16Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3,
          ],
          "pokemon": "MOCKEMON",
        },
        "produceFromSkill": {
          "berries": [],
          "ingredients": [],
        },
        "produceTotal": {
          "berries": [
            {
              "amount": 1,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "produceWithoutSkill": {
          "berries": [
            {
              "amount": 1,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [],
        },
        "skillAmount": 2066,
        "skillProcs": 1,
        "skillValue": {
          "strength": {
            "amountToSelf": 2066,
            "amountToTeam": 0,
          },
        },
      }
    `);
  });
});

describe('degradeEnergy', () => {
  it('shall degrade energy by 1', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(100, memberState);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(99);
  });

  it('shall degrade by less than 1 if less than 1 energy left total', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(0.1, memberState);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });

  it('shall not degrade if energy at 0', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });
});

describe('wasteEnergy', () => {
  it('should count wasted energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wasteEnergy(10);
    expect(memberState.results(1).advanced.wastedEnergy).toBe(10);
  });
});

describe('addSkillValue', () => {
  it('should count regular and crit value', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addSkillValue({ regular: 10, crit: 20 });
    expect(memberState.results(1).advanced.skillCritValue).toBe(20);
    expect(memberState.results(1).skillAmount).toBe(30);
  });
});
