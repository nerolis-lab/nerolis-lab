import { ChargeStrengthSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-range-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeStrengthSRange } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('ChargeStrengthSRangeEffect', () => {
  let skillState: SkillState;
  let chargeStrengthSRangeEffect: ChargeStrengthSRangeEffect;

  beforeEach(() => {
    skillState = mocks.skillState(mocks.memberState());
    chargeStrengthSRangeEffect = new ChargeStrengthSRangeEffect();
  });

  it('should activate skill and return correct skill activation', () => {
    const activation = chargeStrengthSRangeEffect.activate(skillState);
    expect(activation).toBeDefined();
    expect(activation.skill).toBe(ChargeStrengthSRange);
    expect(activation.activations[0].unit).toBe('strength');
    expect(activation.activations[0].self).toEqual({
      regular: skillState.skillAmount(ChargeStrengthSRange.activations.strength),
      crit: 0
    });
  });
});
