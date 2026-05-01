import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { IngredientMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-effect.js';
import { rounded } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-test-util.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet } from 'sleepapi-common';
import { ingredient, IngredientMagnetS, ingredientSetToFloatFlat } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('IngredientMagnetSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let ingredientMagnetSEffect: IngredientMagnetSEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    ingredientMagnetSEffect = new IngredientMagnetSEffect();
  });

  it('should activate and add ingredients correctly', () => {
    const ingMagnetAmount = 50;
    vimic(skillState, 'skillAmount', () => ingMagnetAmount);
    vimic(skillState.memberState.cookingState!, 'addIngredients');
    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      amount: ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
      ingredient: ing
    }));
    const magnetIngredientsFloat = ingredientSetToFloatFlat(magnetIngredients);

    const result = ingredientMagnetSEffect.activate(skillState);

    expect(skillState.memberState.cookingState?.addIngredients).toHaveBeenCalledWith(magnetIngredientsFloat);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(rounded((skillState.memberState as any).skillProduce.ingredients)).toEqual(rounded(magnetIngredients));
    expect(result).toEqual({
      skill: IngredientMagnetS,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: ingMagnetAmount, crit: 0 }
        }
      ]
    });
  });
});
