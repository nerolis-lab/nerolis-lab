import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { CookingAssistSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet } from 'sleepapi-common';
import { CookingAssistS, ingredient, ingredientSetToFloatFlat, MathUtils } from 'sleepapi-common';
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
    expect(
      skillState.memberState.skillProduce.ingredients.map(({ ingredient, amount }) => ({
        ingredient,
        amount: MathUtils.round(amount, 2)
      }))
    ).toEqual(magnetIngredients.map(({ ingredient, amount }) => ({ ingredient, amount: MathUtils.round(amount, 2) })));
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
