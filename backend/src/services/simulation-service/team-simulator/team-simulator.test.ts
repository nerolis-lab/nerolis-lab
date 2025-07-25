import type { TeamActivationValue } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { PokemonWithIngredients, TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import {
  BerryBurstDisguise,
  ChargeStrengthS,
  EnergyForEveryone,
  PINSIR,
  RandomUtils,
  calculatePityProcThreshold,
  commonMocks,
  ingredient,
  nature,
  subskill
} from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

const mockPokemonWithIngredients: PokemonWithIngredients = {
  pokemon: commonMocks.mockPokemon({
    carrySize: 10,
    frequency: 3600,
    ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredientPercentage: 20,
    skill: ChargeStrengthS,
    skillPercentage: 100,
    specialty: 'skill'
  }),
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};
const mockSettings: TeamSettingsExt = mocks.teamSettingsExt({ includeCooking: true });
const mockMembers: TeamMemberExt[] = [
  {
    pokemonWithIngredients: mockPokemonWithIngredients,
    settings: {
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: new Set(),
      externalId: 'some id'
    }
  }
];

describe('TeamSimulator', () => {
  it('shall return expected production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`36`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8`);
    expect(result.members[0].advanced.morningProcs).toBe(2);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall return expected variant production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, iterations: 1 });

    simulator.simulate();

    const result = simulator.ivResults(mockMembers[0].settings.externalId);

    expect(result.produceTotal.berries[0].amount).toMatchInlineSnapshot(`36`);
    expect(result.produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8`);
    expect(result.skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettingsExt = mocks.teamSettingsExt({
      includeCooking: true,
      wakeup: TimeUtils.parseTime('06:01')
    });

    const members: TeamMemberExt[] = [
      {
        pokemonWithIngredients: {
          pokemon: PINSIR,
          ingredientList: [
            { amount: 2, ingredient: ingredient.HONEY },
            { amount: 5, ingredient: ingredient.HONEY },
            { amount: 7, ingredient: ingredient.HONEY }
          ]
        },
        settings: {
          carrySize: 24,
          level: 60,
          ribbon: 0,
          nature: nature.MILD,
          skillLevel: 6,
          subskills: new Set([subskill.INGREDIENT_FINDER_M.name]),
          externalId: 'some id'
        }
      }
    ];
    const simulator = new TeamSimulator({ settings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toBeCloseTo(41);
    expect(result.members[0].produceTotal.ingredients[0].amount).toBeCloseTo(96);
  });

  it('shall calculate team with multiple members', () => {
    const mockMember: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonWithIngredients,
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

    const members: TeamMemberExt[] = [mockMember, mockMember, mockMember, mockMember, mockMember];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);

    expect(result.members[0].produceTotal.berries[0].amount).toEqual(37);
    expect(result.members[0].produceTotal.ingredients[0].amount).toEqual(7);
    expect(result.members[0].skillProcs).toEqual(35);

    expect(result.members[1].produceTotal.berries[0].amount).toEqual(32);
    expect(result.members[1].produceTotal.ingredients[0].amount).toEqual(12);
    expect(result.members[1].skillProcs).toEqual(35);

    expect(result.members[2].produceTotal.berries[0].amount).toEqual(36);
    expect(result.members[2].produceTotal.ingredients[0].amount).toEqual(8);
    expect(result.members[2].skillProcs).toEqual(35);

    expect(result.members[3].produceTotal.berries[0].amount).toEqual(36);
    expect(result.members[3].produceTotal.ingredients[0].amount).toEqual(8);
    expect(result.members[3].skillProcs).toEqual(35);

    expect(result.members[4].produceTotal.berries[0].amount).toEqual(37);
    expect(result.members[4].produceTotal.ingredients[0].amount).toEqual(7);
    expect(result.members[4].skillProcs).toEqual(35);
  });

  it('team members shall affect each other', () => {
    const mockMember: TeamMemberExt = {
      pokemonWithIngredients: mockPokemonWithIngredients,
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
    const mockMemberSupport: TeamMemberExt = {
      pokemonWithIngredients: {
        ...mockPokemonWithIngredients,
        pokemon: { ...mockPokemonWithIngredients.pokemon, skillPercentage: 100, skill: EnergyForEveryone }
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

    const members: TeamMemberExt[] = [mockMember, mockMemberSupport];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(2);

    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`50`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`11`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`42`);
  });

  it('shall count wasted energy', () => {
    const mockMemberSupport: TeamMemberExt = {
      pokemonWithIngredients: {
        ...mockPokemonWithIngredients,
        pokemon: { ...mockPokemonWithIngredients.pokemon, skillPercentage: 100, skill: EnergyForEveryone }
      },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.ADAMANT,
        skillLevel: EnergyForEveryone.maxLevel,
        subskills: new Set([subskill.HELPING_SPEED_M.name]),
        externalId: 'some id'
      }
    };

    const members: TeamMemberExt[] = [
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);
    const skillAmount = result.members[0].skillAmount;
    const wasteAmount = result.members[0].advanced.wastedEnergy;
    expect(skillAmount).toMatchInlineSnapshot(`726.5`);
    expect(wasteAmount).toMatchInlineSnapshot(`4070`);
    expect(
      5 * result.members[0].skillProcs * EnergyForEveryone.activations.energy.amount(EnergyForEveryone.maxLevel)
    ).toEqual(skillAmount + wasteAmount);
  });

  it('shall give pity procs when threshold met', () => {
    const mockMember = {
      ...mockPokemonWithIngredients,
      pokemon: { ...mockPokemonWithIngredients.pokemon, frequency: 3000, skillPercentage: 0 }
    };
    const members: TeamMemberExt[] = [
      {
        pokemonWithIngredients: mockMember,
        settings: {
          carrySize: 10,
          level: 60,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 6,
          subskills: new Set(),
          externalId: 'some id'
        }
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();
    expect(result.members).toHaveLength(1);
    const member = result.members[0];

    const helpsBeforeSS = member.advanced.dayHelps + member.advanced.nightHelpsBeforeSS;
    const pityProcThreshold = calculatePityProcThreshold(mockMember.pokemon);
    const expectedPityProcs = Math.floor(helpsBeforeSS / pityProcThreshold);

    expect(helpsBeforeSS).toMatchInlineSnapshot(`49`);
    expect(pityProcThreshold).toMatchInlineSnapshot(`48`);
    expect(expectedPityProcs).toMatchInlineSnapshot(`1`);

    expect(member.skillProcs).toMatchInlineSnapshot(`1`);
  });

  it('shall only allow 1 disguise crit until sleep reset', () => {
    const spy = vimic(RandomUtils, 'roll', () => true);

    const members: TeamMemberExt[] = [
      {
        pokemonWithIngredients: {
          ...mockPokemonWithIngredients,
          pokemon: {
            ...commonMocks.mockPokemon(),
            skill: BerryBurstDisguise,
            // one help every ~12 hours, final x2 multiplication is to account for energy frequency
            frequency: 60 * 60 * 12 * 2,
            // 100% chance to activate skill per help
            skillPercentage: 100
          }
        },
        settings: {
          carrySize: 10,
          level: 1,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 6,
          subskills: new Set(),
          externalId: 'some id'
        }
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].skillProcs).toBe(2);
    expect(result.members[0].produceFromSkill.berries).toHaveLength(1);
    const amountPerProc = BerryBurstDisguise.activations.berries.amount(6);
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(amountPerProc * 3 + amountPerProc);
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(84);

    spy.mockRestore();
  });
});

describe('recoverMemberEnergy', () => {
  it("shall recover every member's energy", () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      iterations: 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    const energy: TeamActivationValue = {
      crit: 0,
      regular: 50
    };

    simulator.recoverMemberEnergy(energy, simulator.memberStates[0]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    simulator.memberStates.forEach((member: any) => {
      expect(member.energy).toBe(50);
    });
  });

  it('shall recover member energy', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      iterations: 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
    simulator.memberStates[0].recoverEnergy(100, simulator.memberStates[0]);

    const energy: TeamActivationValue = {
      crit: 0,
      regular: 50,
      chanceToTargetLowestMember: 1
    };

    simulator.recoverMemberEnergy(energy, simulator.memberStates[0]);
    expect(simulator.memberStates).toHaveLength(2);
    expect(simulator.memberStates[0].energy).toBe(100);
    expect(simulator.memberStates[1].energy).toBe(50);
  });
});
