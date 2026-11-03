import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { CookingAdvanceSMysticalFireEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-advance-s/cooking-advance-s-mystical-fire-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { CookingAdvanceSMysticalFire, type MainskillActivation } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CookingAdvanceSMysticalFireEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let skillEffect: CookingAdvanceSMysticalFireEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    skillEffect = new CookingAdvanceSMysticalFireEffect();
  });

  it('should activate and add pot size and crit bonus correctly', () => {
    const potAmount = 10;
    const tastyAmount = 3;
    vimic(skillState, 'skillAmount', (activation: MainskillActivation) =>
      activation.unit === 'pot size' ? potAmount : tastyAmount
    );
    const addPotSizeMock = vimic(memberState.cookingState!, 'addPotSize');
    const addCritBonusMock = vimic(memberState.cookingState!, 'addCritBonus');

    const result = skillEffect.activate(skillState);

    expect(addPotSizeMock).toHaveBeenCalledWith(potAmount);
    expect(addCritBonusMock).toHaveBeenCalledWith(tastyAmount / 100);
    expect(result).toEqual({
      skill: CookingAdvanceSMysticalFire,
      activations: [
        {
          unit: 'pot size',
          self: { regular: potAmount, crit: 0 }
        },
        {
          unit: 'crit chance',
          self: { regular: tastyAmount, crit: 0 }
        }
      ]
    });
  });
});
