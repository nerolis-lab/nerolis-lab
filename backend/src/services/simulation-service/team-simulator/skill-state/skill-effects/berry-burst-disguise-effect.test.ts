import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { BerryBurstDisguiseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-disguise-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CarrySizeUtils, mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';

describe('BerryBurstDisguiseEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let berryBurstDisguiseEffect: BerryBurstDisguiseEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    berryBurstDisguiseEffect = new BerryBurstDisguiseEffect();
  });

  it('should add berries to inventory correctly', () => {
    const regularSelfAmount = 10;
    const regularOtherAmount = 5;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'rng', () => 0.9);
    mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel(mainskill.BERRY_BURST_DISGUISE) - 1] =
      regularOtherAmount;
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstDisguiseEffect.activate(skillState);

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
      skill: mainskill.BERRY_BURST_DISGUISE,
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: 0
      }
    });
  });

  it('should correctly support crit', () => {
    const regularSelfAmount = 10;
    const regularOtherAmount = 5;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'rng', () => 0.01);
    mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel(mainskill.BERRY_BURST_DISGUISE) - 1] =
      regularOtherAmount;
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstDisguiseEffect.activate(skillState);

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
            amount: regularSelfAmount * mainskill.DISGUISE_CRIT_MULTIPLIER,
            level: memberState.level
          }
        ]
      }
    );
    expect(result).toEqual({
      skill: mainskill.BERRY_BURST_DISGUISE,
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: 20
      }
    });
  });

  it('should handle no other members correctly', () => {
    memberState.otherMembers = [];
    const regularSelfAmount = 10;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'rng', () => 0.9);
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = berryBurstDisguiseEffect.activate(skillState);

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
      skill: mainskill.BERRY_BURST_DISGUISE,
      selfValue: {
        regular: regularSelfAmount,
        crit: 0
      }
    });
  });
});
