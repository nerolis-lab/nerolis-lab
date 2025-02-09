import { ingredient, nature, PIKACHU, type PokemonInstanceExt } from 'sleepapi-common'

export function createMockPokemon(attrs?: Partial<PokemonInstanceExt>): PokemonInstanceExt {
  return {
    name: 'Bubbles',
    externalId: 'external-id',
    pokemon: PIKACHU,
    carrySize: 10,
    ingredients: [
      { level: 0, ingredient: ingredient.FANCY_APPLE, amount: 2 },
      { level: 30, ingredient: ingredient.FANCY_APPLE, amount: 5 },
      { level: 60, ingredient: ingredient.FANCY_APPLE, amount: 7 }
    ],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    gender: undefined,
    skillLevel: 1,
    subskills: [],
    version: 1,
    rp: 0,
    ...attrs
  }
}
