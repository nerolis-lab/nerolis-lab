import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { IngredientMagnetSPresentEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s-present-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet } from 'sleepapi-common';
import { ingredient, ingredientSetToFloatFlat, MathUtils, PresentIngredientMagnetS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('IngredientMagnetSPresentEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let ingredientMagnetSPresentEffect: IngredientMagnetSPresentEffect;

  beforeEach(() => {
    memberState = mocks.memberState({ cookingState: mocks.cookingState() });
    skillState = mocks.skillState(memberState);
    ingredientMagnetSPresentEffect = new IngredientMagnetSPresentEffect();
  });

  it('should activate and add ingredients correctly', () => {
    const ingMagnetAmount = 50;
    vimic(skillState, 'skillAmount', () => ingMagnetAmount);
    vimic(skillState.memberState.cookingState!, 'addIngredients');
    vimic(skillState, 'rng', () => 0.3); // Roll succeeds (0.3 < 0.5)
    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      amount: ingMagnetAmount / ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
      ingredient: ing
    }));
    const magnetIngredientsFloat = ingredientSetToFloatFlat(magnetIngredients);

    const result = ingredientMagnetSPresentEffect.activate(skillState);

    expect(skillState.memberState.cookingState?.addIngredients).toHaveBeenCalledWith(magnetIngredientsFloat);
    expect(
      skillState.memberState.skillProduce.ingredients.map(({ ingredient, amount }) => ({
        ingredient,
        amount: MathUtils.round(amount, 2)
      }))
    ).toEqual(magnetIngredients.map(({ ingredient, amount }) => ({ ingredient, amount: MathUtils.round(amount, 2) })));
    expect(result.skill).toBe(PresentIngredientMagnetS);
    expect(result.activations).toHaveLength(2);
    expect(result.activations[0]).toEqual({
      unit: 'ingredients',
      self: { regular: ingMagnetAmount, crit: 0 }
    });
    expect(result.activations[1]).toEqual({
      unit: 'candy',
      team: { regular: PresentIngredientMagnetS.candyAmount, crit: 0 }
    });
  });

  it('should include candy in activations when roll succeeds', () => {
    const ingMagnetAmount = 4;
    vimic(skillState, 'skillAmount', () => ingMagnetAmount);
    // Mock rng to return 0.3, which is less than candyChance (0.5), so candy should be given
    const rngMock = vimic(skillState, 'rng', () => 0.3);

    const result = ingredientMagnetSPresentEffect.activate(skillState);

    expect(rngMock).toHaveBeenCalled();
    expect(result.activations).toHaveLength(2);
    expect(result.activations[1]).toEqual({
      unit: 'candy',
      team: { regular: PresentIngredientMagnetS.candyAmount, crit: 0 }
    });
    expect(PresentIngredientMagnetS.candyAmount).toBe(4);
  });

  it('should not include candy in activations when roll fails', () => {
    const ingMagnetAmount = 4;
    vimic(skillState, 'skillAmount', () => ingMagnetAmount);
    vimic(skillState, 'rng', () => 0.7); // Roll fails (0.7 >= 0.5)

    const result = ingredientMagnetSPresentEffect.activate(skillState);

    expect(result.activations).toHaveLength(1);
    expect(result.activations[0]).toEqual({
      unit: 'ingredients',
      self: { regular: ingMagnetAmount, crit: 0 }
    });
  });

  it('should return correct skill', () => {
    const ingMagnetAmount = 4;
    vimic(skillState, 'skillAmount', () => ingMagnetAmount);

    const result = ingredientMagnetSPresentEffect.activate(skillState);

    expect(result.skill).toBe(PresentIngredientMagnetS);
  });
});
