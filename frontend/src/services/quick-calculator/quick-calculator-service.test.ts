import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuickCalculatorService } from './quick-calculator-service'

// Mock the serverAxios
vi.mock('@/router/server-axios', () => ({
  default: {
    post: vi.fn()
  }
}))

// Mock the utils
vi.mock('@/services/utils/pokemon-instance-utils', () => ({
  PokemonInstanceUtils: {
    toPokemonInstanceIdentity: vi.fn()
  }
}))

describe('QuickCalculatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDefaultSettings', () => {
    it('returns default team settings', () => {
      const settings = QuickCalculatorService.getDefaultSettings()

      expect(settings).toEqual({
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        stockpiledIngredients: []
      })
    })
  })

  describe('createDefaultPokemon', () => {
    it('throws error for unimplemented method', () => {
      expect(() => {
        QuickCalculatorService.createDefaultPokemon('PIKACHU')
      }).toThrow('Default Pokemon creation not implemented yet')
    })
  })
})
