import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergyForEveryoneBerryJuiceEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-berry-juice-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EnergyForEveryoneBerryJuiceEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: EnergyForEveryoneBerryJuiceEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    effect = new EnergyForEveryoneBerryJuiceEffect();
  });

  it('should create an item with a successful roll', () => {
    const alwaysSucceed = 0;
    vimic(skillState, 'rng', () => alwaysSucceed);

    const result = effect.activate(skillState);

    expect(result.activations.filter((activation) => activation.unit == 'items')).toHaveLength(1);
  });

  it('should not create an item with a failed roll', () => {
    const alwaysFail = 1;
    vimic(skillState, 'rng', () => alwaysFail);

    const result = effect.activate(skillState);

    expect(result.activations.filter((activation) => activation.unit == 'items')).toHaveLength(0);
  });
});
