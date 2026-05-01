import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { CookingAssistSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s/cooking-assist-s-effect.js';
import { rounded } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-test-util.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet } from 'sleepapi-common';
import { CookingAssistS, ingredient, ingredientSetToFloatFlat } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CookingAssistSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let cookingAssistSEffect: CookingAssistSEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    cookingAssistSEffect = new CookingAssistSEffect();
  });

  it('should activate and add ingredients correctly', () => {
    const ingredientAmount = 50;
    vimic(skillState, 'skillAmount', () => ingredientAmount);
    vimic(skillState.memberState.cookingState!, 'addIngredients');
    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      amount: ingredientAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
      ingredient: ing
    }));
    const magnetIngredientsFloat = ingredientSetToFloatFlat(magnetIngredients);

    const result = cookingAssistSEffect.activate(skillState);

    expect(skillState.memberState.cookingState?.addIngredients).toHaveBeenCalledWith(magnetIngredientsFloat);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(rounded((skillState.memberState as any).skillProduce.ingredients)).toEqual(rounded(magnetIngredients));
    expect(result).toEqual({
      skill: CookingAssistS,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingredientAmount, crit: 0 }
        }
      ]
    });
  });
});
