import { CookingAdvanceSMysticalFireEffect } from './cooking-advance-s-mystical-fire-effect.js';
import { mocks } from '@src/vitest/index.js';
import { CookingAdvanceSMysticalFire } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

describe('CookingAdvanceSMysticalFireEffect', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('applies both cooking effects at level %i', (skillLevel) => {
    const cookingState = mocks.cookingState();
    const skillState = mocks.skillState(mocks.memberState({ cookingState }));
    skillState.skillAmount = (activation) => activation.amount({ skillLevel });
    const addPotSize = vimic(cookingState, 'addPotSize');
    const addCritBonus = vimic(cookingState, 'addCritBonus');
    const potAmount = [7, 10, 12, 17, 22, 27, 31][skillLevel - 1];
    const critAmount = [1, 2, 2, 3, 3, 4, 5][skillLevel - 1];

    const result = new CookingAdvanceSMysticalFireEffect().activate(skillState);

    expect(addPotSize).toHaveBeenCalledExactlyOnceWith(potAmount);
    expect(addCritBonus).toHaveBeenCalledExactlyOnceWith(critAmount / 100);
    expect(result).toEqual({
      skill: CookingAdvanceSMysticalFire,
      activations: [
        { unit: 'pot size', self: { regular: potAmount, crit: 0 } },
        { unit: 'crit chance', self: { regular: critAmount, crit: 0 } }
      ]
    });
  });

  it('reports both effects without a cooking simulation', () => {
    const skillState = mocks.skillState(mocks.memberState());
    skillState.memberState.cookingState = undefined;
    skillState.skillAmount = (activation) => activation.amount({ skillLevel: 7 });

    expect(new CookingAdvanceSMysticalFireEffect().activate(skillState).activations).toEqual([
      { unit: 'pot size', self: { regular: 31, crit: 0 } },
      { unit: 'crit chance', self: { regular: 5, crit: 0 } }
    ]);
  });
});
