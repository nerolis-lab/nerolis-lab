import { describe, expect, it } from 'vitest';
import { mocks } from '@src/vitest/index.js';
import { IngredientMagnetSEffect } from '../skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-effect.js';
import { IngredientMagnetSPlusPlusleEffect } from '../skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-plus-effect.js';
import { vimic } from 'vimic';
import {
  commonMocks,
  ingredient,
  IngredientDrawSDwebble,
  IngredientMagnetS,
  IngredientMagnetSPlusPlusle,
  Metronome,
  type Mainskill
} from 'sleepapi-common';

function memberWithSkill(skill: Mainskill) {
  return mocks.memberState({
    member: mocks.teamMember({
      pokemonWithIngredients: mocks.pokemonWithIngredients({
        pokemon: commonMocks.mockPokemon({ skill }),
        ingredientList: [{ ingredient: ingredient.FANCY_EGG, amount: 1 }]
      })
    })
  });
}

describe('daily ingredient production', () => {
  it('excludes Magnet-only ingredients from an egg-list Metronome user', () => {
    const member = memberWithSkill(Metronome);
    member.addSkillProduce({
      berries: [],
      ingredients: [
        { ingredient: ingredient.MOOMOO_MILK, amount: 9 },
        { ingredient: ingredient.SOOTHING_CACAO, amount: 7 },
        { ingredient: ingredient.GLOSSY_AVOCADO, amount: 8 }
      ]
    });
    const result = member.results(1);
    expect(Object.keys(result.advanced.ingredientDistributions).sort()).toEqual([
      'Coffee',
      'Corn',
      'Egg',
      'Mushroom',
      'Oil',
      'Potato',
      'Sausage',
      'Soybean',
      'Tomato'
    ]);
    expect(result.advanced.nonSignificantIngredientAverage).toBe(24);
  });

  it('includes skill output and fractional inventory amounts in significant distributions', () => {
    const member = memberWithSkill(IngredientDrawSDwebble);
    member.addSkillProduce({
      berries: [],
      ingredients: [
        { ingredient: ingredient.FANCY_EGG, amount: 2.5 },
        { ingredient: ingredient.GLOSSY_AVOCADO, amount: 9 }
      ]
    });
    const result = member.results(1);
    expect(result.advanced.ingredientDistributions.Egg).toEqual({ 2.5: 100 });
    expect(result.advanced.ingredientDistributions.Avocado).toEqual({ 9: 100 });
  });

  it('includes draw ingredients even when there are no activations', () => {
    const result = memberWithSkill(IngredientDrawSDwebble).results(1);
    expect(result.advanced.ingredientDistributions.Avocado).toEqual({ 0: 100 });
    expect(result.advanced.ingredientDistributions.Milk).toBeUndefined();
  });

  it('keeps Magnet-only ingredients outside the graph while retaining their sampled average', () => {
    const member = memberWithSkill(IngredientMagnetS);
    const state = mocks.skillState(member);
    vimic(state, 'rng', () => 0);
    vimic(state, 'skillAmount', () => 11);
    new IngredientMagnetSEffect().activate(state);
    const result = member.results(1);
    expect(result.produceFromSkill.ingredients.reduce((sum, { amount }) => sum + amount, 0)).toBe(11);
    expect(Object.keys(result.advanced.ingredientDistributions)).toEqual(['Egg']);
    expect(result.advanced.nonSignificantIngredientAverage).toBe(11);
    expect(result.advanced.ingredientMagnetProduction?.reduce((sum, { amount }) => sum + amount, 0)).toBe(11);
  });

  it('separates paired Plus bonuses from sampled Magnet output and includes both in daily production', () => {
    const member = memberWithSkill(IngredientMagnetSPlusPlusle);
    member.otherMembers = [memberWithSkill(IngredientMagnetSPlusPlusle)];
    const state = mocks.skillState(member);
    vimic(state, 'rng', () => 0);
    vimic(state, 'skillAmount', (activation) => (activation === IngredientMagnetSPlusPlusle.activations.solo ? 5 : 6));
    new IngredientMagnetSPlusPlusleEffect().activate(state);
    const result = member.results(1);
    expect(result.advanced.ingredientDistributions.Egg).toEqual({ 6: 100 });
    expect(result.advanced.nonSignificantIngredientAverage).toBe(5);
    expect(result.advanced.ingredientMagnetProduction?.reduce((sum, { amount }) => sum + amount, 0)).toBe(5);
    expect(result.produceFromSkill.ingredients.reduce((sum, { amount }) => sum + amount, 0)).toBe(11);
  });

  it('attributes teammate help output to its recipient', () => {
    const invoker = memberWithSkill(IngredientMagnetS);
    const recipient = mocks.memberState({
      member: mocks.teamMember({
        pokemonWithIngredients: mocks.pokemonWithIngredients({
          pokemon: commonMocks.mockPokemon({ ingredientPercentage: 100 }),
          ingredientList: [{ ingredient: ingredient.GLOSSY_AVOCADO, amount: 2 }]
        })
      })
    });
    recipient.addHelpsFromSkill({ regular: 1, crit: 0 }, invoker);
    expect(recipient.results(1).advanced.ingredientDistributions.Avocado).toEqual({ 2: 100 });
    expect(invoker.results(1).advanced.ingredientDistributions.Avocado).toBeUndefined();
  });
});
