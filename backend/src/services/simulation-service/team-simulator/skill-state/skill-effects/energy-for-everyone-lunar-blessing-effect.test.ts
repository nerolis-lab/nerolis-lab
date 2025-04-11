import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergyForEveryoneLunarBlessingEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-lunar-blessing-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import * as commonModule from 'sleepapi-common';
import { CarrySizeUtils, mainskill, MAX_TEAM_SIZE } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EnergyForEveryoneLunarBlessingEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: EnergyForEveryoneLunarBlessingEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    effect = new EnergyForEveryoneLunarBlessingEffect();
  });

  it('should activate with correct berry amounts for 1 unique member', () => {
    const unique = 1;
    const skillLevel = 1;
    const energyForEveryoneAmount = 15;

    const preExistingSkillProduce = mocks.produce();
    const expectedSelfBerryAmount = mainskill.LUNAR_BLESSING_SELF_BERRIES[unique - 1][skillLevel - 1];

    const mockTeam = [mocks.teamMemberExt()];
    Object.defineProperty(memberState, 'team', {
      get: () => mockTeam
    });
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    vimic(skillState, 'skillLevel', () => skillLevel);
    vimic(skillState, 'skillAmount', () => energyForEveryoneAmount);

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGY_FOR_EVERYONE_LUNAR_BLESSING,
      teamValue: {
        regular: energyForEveryoneAmount,
        crit: 0
      }
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [{ berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }],
      ingredients: []
    });
  });

  it('should activate with correct berry amounts for maximum unique members', () => {
    const unique = MAX_TEAM_SIZE;
    const skillLevel = 3;
    const energyForEveryoneAmount = 25;

    const team = Array(5)
      .fill(null)
      .map((_, index) =>
        mocks.teamMemberExt({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: `member ${index}` })
          })
        })
      );

    Object.defineProperty(memberState, 'team', {
      get: () => team
    });

    Object.defineProperty(memberState, 'otherMembers', {
      get: () => team.slice(1).map((member) => mocks.memberState({ member }))
    });

    vimic(commonModule, 'uniqueMembersWithBerry', () => unique);

    vimic(skillState, 'skillLevel', () => skillLevel);
    vimic(skillState, 'skillAmount', () => energyForEveryoneAmount);

    const expectedSelfBerryAmount = mainskill.LUNAR_BLESSING_SELF_BERRIES[unique - 1][skillLevel - 1];
    const expectedTeamBerryAmount = mainskill.LUNAR_BLESSING_TEAM_BERRIES[unique - 1][skillLevel - 1];

    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGY_FOR_EVERYONE_LUNAR_BLESSING,
      teamValue: {
        regular: energyForEveryoneAmount,
        crit: 0
      }
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...team.slice(1).map((member) => ({
          berry: member.pokemonWithIngredients.pokemon.berry,
          amount: expectedTeamBerryAmount,
          level: member.settings.level
        })),
        { berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should handle bogus members', () => {
    const skillLevel = 1;
    const energyForEveryoneAmount = 15;

    const largeTeam = Array(MAX_TEAM_SIZE + 2)
      .fill(null)
      .map((_, index) =>
        mocks.teamMemberExt({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: `member ${index}` })
          })
        })
      );
    Object.defineProperty(memberState, 'team', {
      get: () => largeTeam
    });

    Object.defineProperty(memberState, 'otherMembers', {
      get: () => largeTeam.slice(1).map((member) => mocks.memberState({ member }))
    });

    vimic(skillState, 'skillLevel', () => skillLevel);
    vimic(skillState, 'skillAmount', () => energyForEveryoneAmount);

    // When team size exceeds MAX_TEAM_SIZE, unique is forced to 1
    const expectedUnique = 1;
    const expectedSelfBerryAmount = mainskill.LUNAR_BLESSING_SELF_BERRIES[expectedUnique - 1][skillLevel - 1];
    const expectedTeamBerryAmount = mainskill.LUNAR_BLESSING_TEAM_BERRIES[expectedUnique - 1][skillLevel - 1];

    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: mainskill.ENERGY_FOR_EVERYONE_LUNAR_BLESSING,
      teamValue: {
        regular: energyForEveryoneAmount,
        crit: 0
      }
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...largeTeam.slice(1).map((member) => ({
          berry: member.pokemonWithIngredients.pokemon.berry,
          amount: expectedTeamBerryAmount,
          level: member.settings.level
        })),
        { berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });
});
