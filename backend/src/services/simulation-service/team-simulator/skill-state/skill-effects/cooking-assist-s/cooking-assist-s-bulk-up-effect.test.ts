import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { CookingAssistSBulkUpEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s/cooking-assist-s-bulk-up-effect.js';
import { rounded } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-test-util.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet, MainskillActivation } from 'sleepapi-common';
import { CookingAssistSBulkUp, ingredient, ingredientSetToFloatFlat } from 'sleepapi-common';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(rounded((skillState.memberState as any).skillProduce.ingredients)).toEqual(rounded(magnetIngredients));
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
