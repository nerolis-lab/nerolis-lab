import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { CookingAssistSBulkUpEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s-bulk-up-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet, MainskillActivation } from 'sleepapi-common';
import { CookingAssistSBulkUp, ingredient, ingredientSetToFloatFlat, MathUtils } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CookingAssistSBulkUpEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let cookingAssistSBulkUpEffect: CookingAssistSBulkUpEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    cookingAssistSBulkUpEffect = new CookingAssistSBulkUpEffect();
  });

  it('should activate and add ingredients and crit bonus correctly', () => {
    const ingredientAmount = 50;
    const critAmount = 4;
    vimic(skillState, 'skillAmount', (activation: MainskillActivation) =>
      activation.unit === 'ingredients' ? ingredientAmount : critAmount
    );
    const addIngredientsMock = vimic(memberState.cookingState!, 'addIngredients');
    const addCritBonusMock = vimic(memberState.cookingState!, 'addCritBonus');

    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      amount: ingredientAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
      ingredient: ing
    }));
    const magnetIngredientsFloat = ingredientSetToFloatFlat(magnetIngredients);

    const result = cookingAssistSBulkUpEffect.activate(skillState);

    expect(addIngredientsMock).toHaveBeenCalledWith(magnetIngredientsFloat);
    expect(addCritBonusMock).toHaveBeenCalledWith(critAmount / 100);
    expect(
      skillState.memberState.skillProduce.ingredients.map(({ ingredient, amount }) => ({
        ingredient,
        amount: MathUtils.round(amount, 2)
      }))
    ).toEqual(magnetIngredients.map(({ ingredient, amount }) => ({ ingredient, amount: MathUtils.round(amount, 2) })));
    expect(result).toEqual({
      skill: CookingAssistSBulkUp,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingredientAmount, crit: 0 }
        },
        {
          unit: 'crit chance',
          self: { regular: critAmount, crit: 0 }
        }
      ]
    });
  });
});
