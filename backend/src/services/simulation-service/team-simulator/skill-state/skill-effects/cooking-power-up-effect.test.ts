import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { CookingPowerUpSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-power-up-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { mainskill } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CookingPowerUpSEffect', () => {
  let skillState: SkillState;
  let cookingPowerUpSEffect: CookingPowerUpSEffect;

  beforeEach(() => {
    skillState = mocks.skillState(mocks.memberState({ cookingState: mocks.cookingState() }));
    cookingPowerUpSEffect = new CookingPowerUpSEffect();
  });

  it('should activate CookingPowerUpSEffect and add pot size', () => {
    const addPotMock = vimic(CookingState.prototype, 'addPotSize');
    const potAmount = 10;
    skillState.skillAmount = () => potAmount;

    const result = cookingPowerUpSEffect.activate(skillState);

    expect(addPotMock).toHaveBeenCalledWith(potAmount);
    expect(result.skill).toBe(mainskill.COOKING_POWER_UP_S);
    expect(result.selfValue).toEqual({ regular: potAmount, crit: 0 });
  });

  it('should handle missing cookingState gracefully', () => {
    skillState.skillAmount = () => 0;
    skillState.memberState.cookingState = undefined;

    const result = cookingPowerUpSEffect.activate(skillState);

    expect(result.skill).toBe(mainskill.COOKING_POWER_UP_S);
    expect(result.selfValue).toEqual({ regular: 0, crit: 0 });
  });
});
