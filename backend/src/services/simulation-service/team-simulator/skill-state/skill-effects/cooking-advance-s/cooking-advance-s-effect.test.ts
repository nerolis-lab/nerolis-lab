import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { CookingAdvanceSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-advance-s/cooking-advance-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { CookingAdvanceS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CookingAdvanceSEffect', () => {
  let skillState: SkillState;
  let cookingAdvanceSEffect: CookingAdvanceSEffect;

  beforeEach(() => {
    skillState = mocks.skillState(mocks.memberState({ cookingState: mocks.cookingState() }));
    cookingAdvanceSEffect = new CookingAdvanceSEffect();
  });

  it('should activate CookingAdvanceSEffect and add pot size', () => {
    const addPotMock = vimic(CookingState.prototype, 'addPotSize');
    const potAmount = 10;
    skillState.skillAmount = () => potAmount;

    const result = cookingAdvanceSEffect.activate(skillState);

    expect(addPotMock).toHaveBeenCalledWith(potAmount);
    expect(result.skill).toBe(CookingAdvanceS);
    expect(result.activations[0].unit).toBe('pot size');
    expect(result.activations[0].self).toEqual({ regular: potAmount, crit: 0 });
  });

  it('should handle missing cookingState gracefully', () => {
    skillState.skillAmount = () => 0;
    skillState.memberState.cookingState = undefined;

    const result = cookingAdvanceSEffect.activate(skillState);

    expect(result.skill).toBe(CookingAdvanceS);
    expect(result.activations[0].unit).toBe('pot size');
    expect(result.activations[0].self).toEqual({ regular: 0, crit: 0 });
  });
});
