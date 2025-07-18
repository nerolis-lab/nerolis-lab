import {
  avatarImage,
  berryImage,
  ingredientImage,
  islandImage,
  mainskillImage,
  pokemonImage,
  recipeImage,
  userAvatar
} from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import {
  berry,
  ChargeEnergyS,
  ChargeStrengthSStockpile,
  commonMocks,
  HelperBoost,
  ISLANDS,
  type Pokemon
} from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const MOCK_POKEMON = commonMocks.mockPokemon()
describe('mainskillImage', () => {
  it('returns correct image path for HELPER_BOOST skill', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      berry: berry.LEPPA,
      skill: HelperBoost
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/type/fire.png')
  })

  it('returns correct image path for stockpile skill', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      skill: ChargeStrengthSStockpile
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/stockpile_strength.png')
  })

  it('returns correct image path for other skills', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      skill: ChargeEnergyS
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/energy.png')
  })
})

describe('pokemonImage', () => {
  it('shall return correct pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: false })).toEqual('/images/pokemon/some-pokemon.png')
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: false })).toEqual('/images/pokemon/some-pokemon.png')
  })

  it('shall return correct shiny pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: true })).toEqual('/images/pokemon/some-pokemon_shiny.png')
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: true })).toEqual('/images/pokemon/some-pokemon_shiny.png')
  })
})

describe('avatarImage', () => {
  it('shall return correct avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: false, happy: false })).toEqual(
      '/images/avatar/portrait/some-pokemon.png'
    )
  })
  it('shall return correct shiny avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: true, happy: false })).toEqual(
      '/images/avatar/portrait/some-pokemon_shiny.png'
    )
  })
  it('shall return correct happy avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: false, happy: true })).toEqual(
      '/images/avatar/happy/some-pokemon_happy.png'
    )
  })
  it('shall return correct shiny happy avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: true, happy: true })).toEqual(
      '/images/avatar/happy/some-pokemon_happy_shiny.png'
    )
  })
})

describe('islandImage', () => {
  ISLANDS.forEach((island) => {
    it(`returns the correct image path for ${island.name} island`, () => {
      const imagePath = islandImage({ favoredBerries: island.berries, background: true })
      expect(imagePath).toBe(`/images/island/background-${island.shortName.toLowerCase()}.png`)
    })
  })

  it('returns greengrass image path if no match is found', () => {
    const imagePath = islandImage({ favoredBerries: [], background: false })
    expect(imagePath).toBe('/images/island/greengrass.png')
  })
})

describe('berryImage', () => {
  it('return the correct image path', () => {
    expect(berryImage(berry.BELUE)).toEqual('/images/berries/belue.png')
  })
})

describe('userAvatar', () => {
  beforeEach(() => {})

  it('returns the correct avatar path from the avatar store', () => {
    const userStore = useUserStore()
    const avatarStore = useAvatarStore()
    Object.defineProperty(avatarStore, 'getAvatarPath', {
      value: vi.fn(() => 'some avatar')
    })
    userStore.avatar = 'test-avatar'

    const result = userAvatar()
    expect(result).toBe('some avatar')
  })

  it('returns the default avatar path if no avatar is set', () => {
    expect(userAvatar()).toBe('/images/avatar/default.png')
  })
})

describe('ingredientImage', () => {
  it('returns correct image path for magnet', () => {
    const result = ingredientImage('magnet')
    expect(result).toBe('/images/ingredient/ingredients.png')
  })

  it('returns correct image path for other ingredients', () => {
    const result = ingredientImage('apple')
    expect(result).toBe('/images/ingredient/apple.png')
  })
})

describe('recipeImage', () => {
  it('returns correct image path for recipe names without underscores', () => {
    const result = recipeImage('applepie')
    expect(result).toBe('/images/recipe/applepie.png')
  })

  it('returns correct image path for recipe names with underscores', () => {
    const result = recipeImage('apple_pie')
    expect(result).toBe('/images/recipe/applepie.png')
  })

  it('returns correct image path for recipe names with multiple underscores', () => {
    const result = recipeImage('apple_pie_with_cream')
    expect(result).toBe('/images/recipe/applepiewithcream.png')
  })
})
