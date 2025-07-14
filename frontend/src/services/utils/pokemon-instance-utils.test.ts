import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { mocks } from '@/vitest'
import {
  CarrySizeUtils,
  ingredient,
  nature,
  PIKACHU,
  RAICHU,
  Ribbon,
  RP,
  subskill,
  type PokemonInstanceExt,
  type PokemonInstanceWithMeta
} from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const mockPokemonInstanceExt: PokemonInstanceExt = mocks.createMockPokemon({
  subskills: [
    { level: 10, subskill: subskill.HELPING_BONUS },
    { level: 25, subskill: subskill.BERRY_FINDING_S }
  ]
})
const mockPokemonInstanceWithMeta: PokemonInstanceWithMeta = {
  version: mockPokemonInstanceExt.version,
  saved: mockPokemonInstanceExt.saved,
  shiny: mockPokemonInstanceExt.shiny,
  gender: mockPokemonInstanceExt.gender,
  externalId: mockPokemonInstanceExt.externalId,
  pokemon: mockPokemonInstanceExt.pokemon.name,
  name: mockPokemonInstanceExt.name,
  level: mockPokemonInstanceExt.level,
  ribbon: mockPokemonInstanceExt.ribbon,
  carrySize: CarrySizeUtils.baseCarrySize(mockPokemonInstanceExt.pokemon),
  skillLevel: mockPokemonInstanceExt.skillLevel,
  nature: mockPokemonInstanceExt.nature.name,
  subskills: [
    { level: 10, subskill: 'Helping Bonus' },
    { level: 25, subskill: 'Berry Finding S' }
  ],
  ingredients: [
    { level: 0, name: 'Apple', amount: 2 },
    { level: 30, name: 'Apple', amount: 5 },
    { level: 60, name: 'Apple', amount: 7 }
  ]
}

describe('toPokemonInstanceExt', () => {
  it('should convert a valid PokemonInstanceWithMeta to PokemonInstanceExt', () => {
    const result = PokemonInstanceUtils.toPokemonInstanceExt(mockPokemonInstanceWithMeta)
    expect(result).toEqual({ ...mockPokemonInstanceExt, rp: 834 })
  })

  it('should throw an error if ingredient data is corrupt (not exactly 3)', () => {
    const corruptInstance: PokemonInstanceWithMeta = {
      ...mockPokemonInstanceWithMeta,
      ingredients: [{ level: 0, name: 'incorrect', amount: 2 }]
    }

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow('Received corrupt ingredient data')
  })

  it('should throw an error if subskill data is corrupt (more than 5)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceWithMeta,
      subskills: [
        { level: 10, subskill: 'Helping Hand' },
        { level: 25, subskill: 'Berry Finder' },
        { level: 50, subskill: 'Speed Boost' },
        { level: 75, subskill: 'Item Finder' },
        { level: 100, subskill: 'Quick Attack' },
        { level: 100, subskill: 'Thunderbolt' } // Extra subskill
      ]
    }

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow('Received corrupt subskill data')
  })
})

describe('toUpsertTeamMemberRequest', () => {
  it('should convert a valid PokemonInstanceExt to PokemonInstanceWithMeta', () => {
    const result = PokemonInstanceUtils.toUpsertTeamMemberRequest(mockPokemonInstanceExt)
    expect(result).toEqual(mockPokemonInstanceWithMeta)
  })

  it('should throw an error if ingredient data is corrupt (not exactly 3)', () => {
    const corruptInstance: PokemonInstanceExt = {
      ...mockPokemonInstanceExt,
      ingredients: [{ level: 0, ingredient: ingredient.BEAN_SAUSAGE, amount: 2 }]
    }

    expect(() => PokemonInstanceUtils.toUpsertTeamMemberRequest(corruptInstance)).toThrow(
      'Received corrupt ingredient data'
    )
  })

  it('should throw an error if subskill data is corrupt (more than 5)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceExt,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 25, subskill: subskill.DREAM_SHARD_BONUS },
        { level: 50, subskill: subskill.ENERGY_RECOVERY_BONUS },
        { level: 75, subskill: subskill.BERRY_FINDING_S },
        { level: 100, subskill: subskill.HELPING_SPEED_M },
        { level: 100, subskill: subskill.INGREDIENT_FINDER_S } // Extra subskill
      ]
    }

    expect(() => PokemonInstanceUtils.toUpsertTeamMemberRequest(corruptInstance)).toThrow(
      'Received corrupt subskill data'
    )
  })
})

describe('toPokemonInstanceIdentity', () => {
  it('should convert a valid PokemonInstanceExt to PokemonInstanceIdentity', () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = mocks.createMockPokemon()
    const result = PokemonInstanceUtils.toPokemonInstanceIdentity(mockPokemonInstanceExt)

    expect(result).toEqual({
      pokemon: mockPokemonInstanceExt.pokemon.name,
      nature: mockPokemonInstanceExt.nature.name,
      subskills: mockPokemonInstanceExt.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: mockPokemonInstanceExt.ingredients.map((ingredientSet) => ({
        level: ingredientSet.level,
        name: ingredientSet.ingredient.name,
        amount: ingredientSet.amount
      })),
      carrySize: CarrySizeUtils.baseCarrySize(mockPokemonInstanceExt.pokemon),
      level: mockPokemonInstanceExt.level,
      ribbon: mockPokemonInstanceExt.ribbon,
      skillLevel: mockPokemonInstanceExt.skillLevel,
      externalId: mockPokemonInstanceExt.externalId
    })
  })
})

describe('createDefaultPokemonInstance', () => {
  it('should create a default pokemon instance with expected values', () => {
    const mockPokemon = mocks.createMockPokemon().pokemon
    const result = PokemonInstanceUtils.createDefaultPokemonInstance(mockPokemon)

    expect(result.pokemon).toBe(mockPokemon)
    expect(result.level).toBe(60)
    expect(result.nature.name).toBe('Bashful')
    expect(result.ribbon).toBe(0)
    expect(result.saved).toBe(false)
    expect(result.shiny).toBe(false)
    expect(result.skillLevel).toBe(mockPokemon.previousEvolutions + 1)
    expect(result.subskills).toEqual([])
    expect(result.ingredients).toHaveLength(3)
    expect(result.ingredients[0].level).toBe(0)
    expect(result.ingredients[1].level).toBe(30)
    expect(result.ingredients[2].level).toBe(60)
    expect(result.rp).toBe(new RP(result).calc())
    expect(result.version).toBe(0)
    expect(result.carrySize).toBe(CarrySizeUtils.baseCarrySize(mockPokemon))
    expect(typeof result.externalId).toBe('string')
    expect(typeof result.name).toBe('string')
  })

  it('should override attributes when provided', () => {
    const mockPokemon = mocks.createMockPokemon().pokemon
    const customAttrs = {
      level: 100,
      name: 'Custom Name',
      shiny: true,
      saved: true,
      version: 5
    }

    const result = PokemonInstanceUtils.createDefaultPokemonInstance(mockPokemon, customAttrs)

    expect(result.level).toBe(100)
    expect(result.name).toBe('Custom Name')
    expect(result.shiny).toBe(true)
    expect(result.saved).toBe(true)
    expect(result.version).toBe(5)
    expect(result.pokemon).toBe(mockPokemon)
  })

  it('should use provided gender when specified', () => {
    const mockPokemon = mocks.createMockPokemon().pokemon
    const result = PokemonInstanceUtils.createDefaultPokemonInstance(mockPokemon, { gender: 'male' })

    expect(result.gender).toBe('male')
  })
})

describe('createPokemonInstanceWithPreservedAttributes', () => {
  it('should preserve existing attributes while updating Pokemon-specific ones', () => {
    // Create existing Pikachu instance with custom attributes
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      pokemon: PIKACHU,
      level: 45,
      name: 'Custom Name',
      nature: nature.ADAMANT,
      ribbon: Ribbon.HOURS_2000,
      shiny: true,
      saved: true,
      skillLevel: 4,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 25, subskill: subskill.BERRY_FINDING_S }
      ],
      version: 3
    })

    // Create new Raichu instance with preserved attributes
    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    // Should preserve these attributes from existing instance
    expect(result.level).toBe(45)
    expect(result.name).toBe('Custom Name')
    expect(result.nature).toBe(nature.ADAMANT)
    expect(result.ribbon).toBe(Ribbon.HOURS_2000)
    expect(result.shiny).toBe(true)
    expect(result.saved).toBe(true)
    expect(result.subskills).toEqual([
      { level: 10, subskill: subskill.HELPING_BONUS },
      { level: 25, subskill: subskill.BERRY_FINDING_S }
    ])
    expect(result.version).toBe(3)
    expect(result.externalId).toBe(existingInstance.externalId)

    // Should update Pokemon-specific attributes
    expect(result.pokemon).toBe(RAICHU)
    expect(result.carrySize).toBe(CarrySizeUtils.baseCarrySize(RAICHU))
    expect(result.ingredients).toEqual([
      { ...RAICHU.ingredient0[0], level: 0 },
      { ...RAICHU.ingredient30[0], level: 30 },
      { ...RAICHU.ingredient60[0], level: 60 }
    ])

    // Should recalculate RP based on new Pokemon and preserved attributes
    expect(result.rp).toBe(new RP(result).calc())
  })

  it('should cap skill level to new Pokemon max skill level', () => {
    // Create instance with high skill level
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      skillLevel: 10 // Very high skill level
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    // Should be capped to Raichu's max skill level
    expect(result.skillLevel).toBe(Math.min(10, RAICHU.skill.maxLevel))
    expect(result.skillLevel).toBeLessThanOrEqual(RAICHU.skill.maxLevel)
  })

  it('should preserve skill level when within new Pokemon limits', () => {
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      skillLevel: 3 // Reasonable skill level
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    // Should preserve the original skill level since it's within limits
    expect(result.skillLevel).toBe(3)
  })

  it('should update ingredients to match new Pokemon species', () => {
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      pokemon: PIKACHU,
      ingredients: [
        { level: 0, ingredient: ingredient.FANCY_APPLE, amount: 2 },
        { level: 30, ingredient: ingredient.FANCY_APPLE, amount: 5 },
        { level: 60, ingredient: ingredient.FANCY_APPLE, amount: 7 }
      ]
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    // Should have Raichu's ingredients, not Pikachu's
    expect(result.ingredients).toEqual([
      { ...RAICHU.ingredient0[0], level: 0 },
      { ...RAICHU.ingredient30[0], level: 30 },
      { ...RAICHU.ingredient60[0], level: 60 }
    ])
    expect(result.ingredients).not.toEqual(existingInstance.ingredients)
  })

  it('should update carry size to match new Pokemon species', () => {
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      pokemon: PIKACHU,
      carrySize: CarrySizeUtils.baseCarrySize(PIKACHU)
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    expect(result.carrySize).toBe(CarrySizeUtils.baseCarrySize(RAICHU))

    // Only assert they're different if the Pokemon actually have different carry sizes
    if (CarrySizeUtils.baseCarrySize(PIKACHU) !== CarrySizeUtils.baseCarrySize(RAICHU)) {
      expect(result.carrySize).not.toBe(existingInstance.carrySize)
    }
  })

  it('should generate new gender for new Pokemon species', () => {
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      gender: 'male'
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    // Should have a valid gender (either male or female)
    expect(['male', 'female']).toContain(result.gender)
  })

  it('should preserve complex subskills configuration', () => {
    const complexSubskills = [
      { level: 10, subskill: subskill.HELPING_BONUS },
      { level: 25, subskill: subskill.BERRY_FINDING_S },
      { level: 50, subskill: subskill.ENERGY_RECOVERY_BONUS },
      { level: 75, subskill: subskill.INGREDIENT_FINDER_M },
      { level: 100, subskill: subskill.HELPING_SPEED_S }
    ]

    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      subskills: complexSubskills
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    expect(result.subskills).toEqual(complexSubskills)
  })

  it('should preserve empty subskills array', () => {
    const existingInstance: PokemonInstanceExt = mocks.createMockPokemon({
      subskills: []
    })

    const result = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(RAICHU, existingInstance)

    expect(result.subskills).toEqual([])
  })
})
