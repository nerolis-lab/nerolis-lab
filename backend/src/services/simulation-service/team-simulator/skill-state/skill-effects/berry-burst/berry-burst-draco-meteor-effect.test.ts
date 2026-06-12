import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { BerryBurstDracoMeteorEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-draco-meteor-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { BerryBurstDracoMeteor, LATIAS, LATIOS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

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
    let timesCalled = 0;
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
});
