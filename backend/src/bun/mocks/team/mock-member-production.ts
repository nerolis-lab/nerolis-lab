import { berrySet } from '@src/bun/mocks/berry/mock-berry-set.js';
import { pokemonWithIngredientsIndexed } from '@src/bun/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { produce } from '@src/bun/mocks/produce/mock-produce.js';
import type { MemberSkillValue } from 'sleepapi-common';
import { mainskillUnits, type MemberProduction, type MemberProductionAdvanced } from 'sleepapi-common';

export function memberProduction(attrs?: Partial<MemberProduction>): MemberProduction {
  return {
    advanced: memberProductionAdvanced(),
    externalId: 'Mock id',
    pokemonWithIngredients: pokemonWithIngredientsIndexed(),
    produceFromSkill: produce(),
    produceTotal: produce(),
    produceWithoutSkill: produce(),
    skillAmount: 0,
    skillProcs: 0,
    skillValue: Object.fromEntries(
      mainskillUnits.map((key) => [key, { amountToSelf: 0, amountToTeam: 0 }])
    ) as MemberSkillValue,
    ...attrs
  };
}

export function memberProductionAdvanced(attrs?: Partial<MemberProductionAdvanced>): MemberProductionAdvanced {
  return {
    averageHelps: 0,
    carrySize: 0,
    maxFrequency: 0,
    dayHelps: 0,
    ingredientPercentage: 0,
    morningProcs: 0,
    nightHelps: 0,
    nightHelpsAfterSS: 0,
    nightHelpsBeforeSS: 0,
    skillCrits: 0,
    skillCritValue: 0,
    skillPercentage: 0,
    frequencySplit: {
      eighty: 0,
      sixty: 0,
      fourty: 0,
      one: 0,
      zero: 0
    },
    skillProcDistribution: {},
    teamSupport: {
      energy: 0,
      helps: 0
    },
    skillRegularValue: 0,
    sneakySnack: berrySet(),
    spilledIngredients: [],
    totalHelps: 0,
    totalRecovery: 0,
    wastedEnergy: 0,
    ...attrs
  };
}
