import { mocks } from '@src/bun/index.js';
import { ChargeStrengthMEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('ChargeStrengthMEffect', () => {
  let chargeStrengthMEffect: ChargeStrengthMEffect;
  let mockSkillState: SkillState;

  beforeEach(() => {
    chargeStrengthMEffect = new ChargeStrengthMEffect();
    mockSkillState = mocks.skillState(mocks.memberState());
  });

  it('should activate skill and return correct values', () => {
    const activation = chargeStrengthMEffect.activate(mockSkillState);
    expect(activation.skill).toBe(mainskill.CHARGE_STRENGTH_M);
    expect(activation.selfValue?.regular).toBe(mockSkillState.skillAmount(mainskill.CHARGE_STRENGTH_M));
    expect(activation.selfValue?.crit).toBe(0);
  });
});
