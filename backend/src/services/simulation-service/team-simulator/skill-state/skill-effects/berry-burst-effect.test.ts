import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state.js';
import { BerryBurstEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BUTTERFREE, CarrySizeUtils, mainskill, NINETALES_ALOLAN } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('BerryBurstEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let berryBurstEffect: BerryBurstEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    berryBurstEffect = new BerryBurstEffect();
  });

  it('should add berries to inventory correctly', () => {
    const regularSelfAmount = 10;
    const regularOtherAmount = 5;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel - 1] = regularOtherAmount;
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstEffect.activate(skillState);

    expect(addToInventoryMock).toHaveBeenCalledWith(
      {
        berries: [],
        ingredients: []
      },
      {
        ingredients: [],
        berries: [
          ...memberState.otherMembers.map((member) => ({
            berry: member.pokemonWithIngredients.pokemon.berry,
            amount: regularOtherAmount,
            level: member.settings.level
          })),
          {
            berry: memberState.berry,
            amount: regularSelfAmount,
            level: memberState.level
          }
        ]
      }
    );
    expect(result).toEqual({
      skill: mainskill.BERRY_BURST,
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: 0
      }
    });
  });

  it('should add berries to inventory correctly', () => {
    memberState = mocks.memberState({
      team: [
        mocks.teamMemberExt({
          settings: mocks.teamMemberSettingsExt({ externalId: 'member1' }),
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: BUTTERFREE })
        }),
        mocks.teamMemberExt({
          settings: mocks.teamMemberSettingsExt({ externalId: 'member1' }),
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: NINETALES_ALOLAN })
        })
      ]
    });
    skillState = mocks.skillState(memberState);
    berryBurstEffect = new BerryBurstEffect();
    const regularSelfAmount = 10;
    const regularOtherAmount = 5;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    mainskill.BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel - 1] = regularOtherAmount;
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstEffect.activate(skillState);

    expect(addToInventoryMock).toHaveBeenCalledWith(
      {
        berries: [],
        ingredients: []
      },
      {
        ingredients: [],
        berries: [
          ...memberState.otherMembers.map((member) => ({
            berry: member.pokemonWithIngredients.pokemon.berry,
            amount: regularOtherAmount,
            level: member.settings.level
          })),
          {
            berry: memberState.berry,
            amount: regularSelfAmount,
            level: memberState.level
          }
        ]
      }
    );
    expect(result).toEqual({
      skill: mainskill.BERRY_BURST,
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: 0
      }
    });
  });

  it('should handle no other members correctly', () => {
    memberState.otherMembers = [];
    const regularSelfAmount = 10;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstEffect.activate(skillState);

    expect(addToInventoryMock).toHaveBeenCalledWith(
      {
        berries: [],
        ingredients: []
      },
      {
        ingredients: [],
        berries: [
          {
            berry: memberState.berry,
            amount: regularSelfAmount,
            level: memberState.level
          }
        ]
      }
    );
    expect(result).toEqual({
      skill: mainskill.BERRY_BURST,
      selfValue: {
        regular: regularSelfAmount,
        crit: 0
      }
    });
  });
});
