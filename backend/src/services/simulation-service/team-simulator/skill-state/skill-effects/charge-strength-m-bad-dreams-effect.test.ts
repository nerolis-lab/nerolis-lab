import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { ChargeStrengthMBadDreamsEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m-bad-dreams-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { berry, mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ChargeStrengthMBadDreamsEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let chargeStrengthMBadDreamsEffect: ChargeStrengthMBadDreamsEffect;
  let mockOtherMembers: MemberState[];
  let addSkillValueMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    chargeStrengthMBadDreamsEffect = new ChargeStrengthMBadDreamsEffect();

    // Create mock other members
    mockOtherMembers = [mocks.memberState(), mocks.memberState()];

    Object.defineProperty(skillState.memberState, 'otherMembers', {
      get: () => mockOtherMembers
    });

    addSkillValueMock = vi.fn();
    skillState.addSkillValue = addSkillValueMock;
  });

  it('should activate skill and return correct self values', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    mockOtherMembers.forEach((member) => {
      Object.defineProperty(member, 'berry', {
        get: () => ({ name: 'Not Wiki Berry' })
      });

      vimic(member, 'degradeEnergy', () => 10);
    });

    const activation = chargeStrengthMBadDreamsEffect.activate(skillState);

    expect(activation.skill).toBe(mainskill.CHARGE_STRENGTH_M_BAD_DREAMS);
    expect(activation.selfValue?.regular).toBe(regularAmount);
    expect(activation.selfValue?.crit).toBe(0);

    // Verify degradeEnergy was called for each other member
    mockOtherMembers.forEach((member) => {
      expect(member.degradeEnergy).toHaveBeenCalledWith(mainskill.BAD_DREAMS_ENERGY_REDUCTION);
    });

    // Verify addSkillValue was called with the correct values
    expect(addSkillValueMock).toHaveBeenCalledWith({
      unit: 'energy',
      amountToSelf: 0,
      amountToTeam: -20 // 10 energy degraded per member × 2 members
    });
  });

  it('should not degrade energy for members with Wiki berries', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    // Set one member to have a Wiki berry, one with a different berry
    Object.defineProperty(mockOtherMembers[0], 'berry', {
      get: () => ({ name: berry.WIKI.name })
    });
    Object.defineProperty(mockOtherMembers[1], 'berry', {
      get: () => ({ name: 'Not Wiki Berry' })
    });

    // Mock the degradeEnergy method
    vimic(mockOtherMembers[0], 'degradeEnergy', () => 0);
    vimic(mockOtherMembers[1], 'degradeEnergy', () => 10);

    chargeStrengthMBadDreamsEffect.activate(skillState);

    // The member with Wiki berry should not have energy degraded
    expect(mockOtherMembers[0].degradeEnergy).not.toHaveBeenCalled();
    expect(mockOtherMembers[1].degradeEnergy).toHaveBeenCalledWith(mainskill.BAD_DREAMS_ENERGY_REDUCTION);

    // Verify addSkillValue was called with the correct values (only one member's energy was degraded)
    expect(addSkillValueMock).toHaveBeenCalledWith({
      unit: 'energy',
      amountToSelf: 0,
      amountToTeam: -10
    });
  });

  it('should handle a team with only Wiki berry members', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    // Set all members to have Wiki berries
    mockOtherMembers.forEach((member) => {
      Object.defineProperty(member, 'berry', {
        get: () => ({ name: berry.WIKI.name })
      });

      // Mock the degradeEnergy method so we can check it's not called
      vimic(member, 'degradeEnergy', () => 0);
    });

    chargeStrengthMBadDreamsEffect.activate(skillState);

    // No members should have energy degraded
    mockOtherMembers.forEach((member) => {
      expect(member.degradeEnergy).not.toHaveBeenCalled();
    });

    // Verify addSkillValue was called with zero energy degraded
    expect(addSkillValueMock).toHaveBeenCalledWith({
      unit: 'energy',
      amountToSelf: 0,
      amountToTeam: -0
    });
  });
});
