import { mocks } from '@src/bun/index.js';
import { ChargeStrengthSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-range-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
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
    expect(activation.skill).toBe(mainskill.CHARGE_STRENGTH_S_RANGE);
    expect(activation.selfValue).toEqual({
      regular: skillState.skillAmount(mainskill.CHARGE_STRENGTH_S_RANGE),
      crit: 0
    });
  });
});
