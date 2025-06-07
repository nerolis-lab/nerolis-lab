import { ChargeStrengthMEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeStrengthM } from 'sleepapi-common';
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
    expect(activation.skill).toBe(ChargeStrengthM);
    expect(activation.activations[0].unit).toBe('strength');
    expect(activation.activations[0].self?.regular).toBe(
      mockSkillState.skillAmount(ChargeStrengthM.activations.strength)
    );
    expect(activation.activations[0].self?.crit).toBe(0);
  });
});
