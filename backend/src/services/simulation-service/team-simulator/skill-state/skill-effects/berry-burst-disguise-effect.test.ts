import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { BerryBurstDisguiseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-disguise-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { BerryBurstDisguise, CarrySizeUtils } from 'sleepapi-common';
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
    skillState.memberState.member.settings.skillLevel = 3;
    vimic(BerryBurstDisguise.activations.berries, 'teamAmount', () => regularOtherAmount);
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
            berry: member.berry,
            amount: regularOtherAmount,
            level: member.level
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
      skill: BerryBurstDisguise,
      activations: [
        {
          unit: 'berries',
          self: { regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length, crit: 0 }
        }
      ]
    });
  });

  it('should correctly support crit', () => {
    const regularSelfAmount = 10;
    const regularOtherAmount = 5;
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'rng', () => 0.01);
    skillState.memberState.member.settings.skillLevel = 3;
    vimic(BerryBurstDisguise.activations.berries, 'teamAmount', () => regularOtherAmount);
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
            amount: regularSelfAmount * BerryBurstDisguise.activations.berries.critMultiplier,
            level: memberState.level
          }
        ]
      }
    );
    expect(result).toEqual({
      skill: BerryBurstDisguise,
      activations: [
        {
          unit: 'berries',
          self: { regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length, crit: 20 }
        }
      ]
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
      skill: BerryBurstDisguise,
      activations: [
        {
          unit: 'berries',
          self: { regular: regularSelfAmount, crit: 0 }
        }
      ]
    });
  });
});
