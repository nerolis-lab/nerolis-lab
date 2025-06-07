import { ChargeStrengthSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeStrengthS } from 'sleepapi-common';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ChargeStrengthSEffect', () => {
  let chargeStrengthSEffect: ChargeStrengthSEffect;
  let mockSkillState: SkillState;

  beforeEach(() => {
    chargeStrengthSEffect = new ChargeStrengthSEffect();
    mockSkillState = mocks.skillState();
  });

  it('should activate ChargeStrengthSEffect correctly', () => {
    const activation = chargeStrengthSEffect.activate(mockSkillState);

    expect(activation.skill).toBe(ChargeStrengthS);
    expect(activation.activations[0].unit).toBe('strength');
    expect(activation.activations[0].self).toEqual({ regular: 400, crit: 0 });
  });
});
