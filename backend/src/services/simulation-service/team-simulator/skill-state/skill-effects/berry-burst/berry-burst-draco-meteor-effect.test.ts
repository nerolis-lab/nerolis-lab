import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { BerryBurstDracoMeteorEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-draco-meteor-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { CarrySizeUtils, BerryBurstDracoMeteor, LATIAS, LATIOS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('BerryBurstDracoMeteorEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: BerryBurstDracoMeteorEffect;

  beforeEach(() => {
    memberState = mocks.memberState({
      member: mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIOS })
      })
    });
    skillState = mocks.skillState(memberState);
    effect = new BerryBurstDracoMeteorEffect();
  });

  it('should activate skill and return correct self value without latias on team', () => {
    const regularSelfAmount = 12;
    const regularTeamAmount = 1;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'skillTeamAmount', () => regularTeamAmount);

    const result = effect.activate(skillState);

    expect(result.skill).toBe(BerryBurstDracoMeteor);
    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: regularSelfAmount + regularTeamAmount * memberState.otherMembers.length,
          crit: 0
        }
      }
    ]);
  });

  it('should use paired activation when latias is on team', () => {
    const soloSelfAmount = 12;
    const pairedSelfAmount = 14;
    const regularTeamAmount = 1;
    memberState.otherMembers = [
      mocks.memberState({
        member: mocks.teamMemberExt({
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIAS })
        })
      })
    ];
    vimic(skillState, 'skillAmount', (activation) => {
      if (activation === BerryBurstDracoMeteor.activations.paired) {
        return pairedSelfAmount;
      }
      return soloSelfAmount;
    });
    vimic(skillState, 'skillTeamAmount', () => regularTeamAmount);

    const result = effect.activate(skillState);

    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: pairedSelfAmount + regularTeamAmount * memberState.otherMembers.length,
          crit: 0
        }
      }
    ]);
  });

  it('should handle no other members correctly', () => {
    memberState.otherMembers = [];
    const regularSelfAmount = 12;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'skillTeamAmount', () => 1);

    const result = effect.activate(skillState);

    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: regularSelfAmount,
          crit: 0
        }
      }
    ]);
  });

  it('should use the solo matrix values for teams with three same-type species', () => {
    const skillLevel = 3;
    const expectedSelfAmount = 35;
    const expectedTeamAmount = 2;

    const sameBerryTeam = [
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIOS })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'same-berry-2', berry: LATIOS.berry })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'off-berry-1' })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'off-berry-2' })
        })
      })
    ];
    sameBerryTeam.forEach((member, index) => {
      member.settings.level = 30 + index;
    });

    memberState = mocks.memberState({
      member: sameBerryTeam[0],
      team: sameBerryTeam
    });
    skillState = mocks.skillState(memberState);
    effect = new BerryBurstDracoMeteorEffect();
    skillState.memberState.member.settings.skillLevel = skillLevel;
    Object.defineProperty(memberState, 'otherMembers', {
      get: () => sameBerryTeam.slice(1).map((member) => mocks.memberState({ member }))
    });
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
          crit: 0
        }
      }
    ]);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: expectedTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: expectedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should use the paired matrix values when latias makes the team count five same-type species', () => {
    const skillLevel = 6;
    const expectedSelfAmount = 68;
    const expectedTeamAmount = 5;

    const sameBerryTeam = [
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIOS })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIAS })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'same-berry-2', berry: LATIOS.berry })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'same-berry-3', berry: LATIOS.berry })
        })
      })
    ];
    sameBerryTeam.forEach((member, index) => {
      member.settings.level = 40 + index;
    });

    memberState = mocks.memberState({
      member: sameBerryTeam[0],
      team: sameBerryTeam
    });
    skillState = mocks.skillState(memberState);
    effect = new BerryBurstDracoMeteorEffect();
    skillState.memberState.member.settings.skillLevel = skillLevel;
    Object.defineProperty(memberState, 'otherMembers', {
      get: () => sameBerryTeam.slice(1).map((member) => mocks.memberState({ member }))
    });
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
          crit: 0
        }
      }
    ]);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: expectedTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: expectedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should count distinct same-type species rather than duplicate teammates of the same species', () => {
    const skillLevel = 2;
    const expectedSelfAmount = 24;
    const expectedTeamAmount = 1;

    const duplicateSpecies = mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry });
    const teamWithDuplicateSpecies = [
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIOS })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: duplicateSpecies })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: duplicateSpecies })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'off-berry-1' })
        })
      }),
      mocks.teamMemberExt({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: mocks.mockPokemon({ name: 'off-berry-2' })
        })
      })
    ];
    teamWithDuplicateSpecies.forEach((member, index) => {
      member.settings.level = 20 + index;
    });

    memberState = mocks.memberState({
      member: teamWithDuplicateSpecies[0],
      team: teamWithDuplicateSpecies
    });
    skillState = mocks.skillState(memberState);
    effect = new BerryBurstDracoMeteorEffect();
    skillState.memberState.member.settings.skillLevel = skillLevel;
    Object.defineProperty(memberState, 'otherMembers', {
      get: () => teamWithDuplicateSpecies.slice(1).map((member) => mocks.memberState({ member }))
    });

    const result = effect.activate(skillState);

    expect(result.activations).toEqual([
      {
        unit: 'berries',
        self: {
          regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
          crit: 0
        }
      }
    ]);
  });
});
