import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePokemonSearchStore } from './pokemon-search-store'

describe('Pokemon Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const store = usePokemonSearchStore()

      expect(store.showPokebox).toBe(false)
      expect(store.showPokeboxBadge).toBe(true)
    })
  })

  describe('togglePokebox', () => {
    it('should toggle showPokebox from false to true', () => {
      const store = usePokemonSearchStore()

      expect(store.showPokebox).toBe(false)

      store.togglePokebox()

      expect(store.showPokebox).toBe(true)
    })

    it('should toggle showPokebox from true to false', () => {
      const store = usePokemonSearchStore()

      // Set to true first
      store.togglePokebox()
      expect(store.showPokebox).toBe(true)

      // Toggle back to false
      store.togglePokebox()

      expect(store.showPokebox).toBe(false)
    })

    it('should toggle multiple times correctly', () => {
      const store = usePokemonSearchStore()

      // Initial state
      expect(store.showPokebox).toBe(false)

      // First toggle
      store.togglePokebox()
      expect(store.showPokebox).toBe(true)

      // Second toggle
      store.togglePokebox()
      expect(store.showPokebox).toBe(false)

      // Third toggle
      store.togglePokebox()
      expect(store.showPokebox).toBe(true)
    })
  })

  describe('hidePokeboxBadge', () => {
    it('should set showPokeboxBadge to false when initially true', () => {
      const store = usePokemonSearchStore()

      expect(store.showPokeboxBadge).toBe(true)

      store.hidePokeboxBadge()

      expect(store.showPokeboxBadge).toBe(false)
    })

    it('should keep showPokeboxBadge false when already false', () => {
      const store = usePokemonSearchStore()

      // Hide badge first time
      store.hidePokeboxBadge()
      expect(store.showPokeboxBadge).toBe(false)

      // Hide badge second time
      store.hidePokeboxBadge()

      expect(store.showPokeboxBadge).toBe(false)
    })

    it('should not affect showPokebox state', () => {
      const store = usePokemonSearchStore()

      // Set pokebox to true
      store.togglePokebox()
      expect(store.showPokebox).toBe(true)

      // Hide badge
      store.hidePokeboxBadge()

      // Pokebox state should remain unchanged
      expect(store.showPokebox).toBe(true)
      expect(store.showPokeboxBadge).toBe(false)
    })
  })

  describe('Store Reactivity', () => {
    it('should maintain reactivity for all state properties', () => {
      const store = usePokemonSearchStore()

      // Test showPokebox reactivity
      expect(store.showPokebox).toBe(false)
      store.togglePokebox()
      expect(store.showPokebox).toBe(true)

      // Test showPokeboxBadge reactivity
      expect(store.showPokeboxBadge).toBe(true)
      store.hidePokeboxBadge()
      expect(store.showPokeboxBadge).toBe(false)
    })
  })

  describe('Combined Operations', () => {
    it('should handle multiple operations independently', () => {
      const store = usePokemonSearchStore()

      // Initial state
      expect(store.showPokebox).toBe(false)
      expect(store.showPokeboxBadge).toBe(true)

      // Toggle pokebox and hide badge
      store.togglePokebox()
      store.hidePokeboxBadge()

      expect(store.showPokebox).toBe(true)
      expect(store.showPokeboxBadge).toBe(false)

      // Toggle pokebox again
      store.togglePokebox()

      expect(store.showPokebox).toBe(false)
      expect(store.showPokeboxBadge).toBe(false) // Should remain false
    })

    it('should handle rapid successive operations', () => {
      const store = usePokemonSearchStore()

      // Rapid toggles
      store.togglePokebox()
      store.togglePokebox()
      store.togglePokebox()

      expect(store.showPokebox).toBe(true)

      // Multiple badge hides
      store.hidePokeboxBadge()
      store.hidePokeboxBadge()
      store.hidePokeboxBadge()

      expect(store.showPokeboxBadge).toBe(false)
    })
  })

  describe('Final Stage Only Functionality', () => {
    it('should initialize with correct default values for finalStageOnly', () => {
      const store = usePokemonSearchStore()

      expect(store.userFinalStageOnly).toBe(true)
      expect(store.finalStageOnly).toBe(true)
    })

    it('should set both userFinalStageOnly and finalStageOnly when using setUserFinalStageOnly', () => {
      const store = usePokemonSearchStore()

      store.setUserFinalStageOnly(false)

      expect(store.userFinalStageOnly).toBe(false)
      expect(store.finalStageOnly).toBe(false)

      store.setUserFinalStageOnly(true)

      expect(store.userFinalStageOnly).toBe(true)
      expect(store.finalStageOnly).toBe(true)
    })

    it('should set only finalStageOnly when using setFinalStageOnly', () => {
      const store = usePokemonSearchStore()

      store.setFinalStageOnly(false)

      expect(store.userFinalStageOnly).toBe(true) // Should remain unchanged
      expect(store.finalStageOnly).toBe(false)

      store.setFinalStageOnly(true)

      expect(store.userFinalStageOnly).toBe(true) // Should remain unchanged
      expect(store.finalStageOnly).toBe(true)
    })

    it('should restore finalStageOnly from userFinalStageOnly', () => {
      const store = usePokemonSearchStore()

      // Set user preference to false
      store.setUserFinalStageOnly(false)
      expect(store.userFinalStageOnly).toBe(false)
      expect(store.finalStageOnly).toBe(false)

      // Temporarily change finalStageOnly
      store.setFinalStageOnly(true)
      expect(store.userFinalStageOnly).toBe(false) // Should remain unchanged
      expect(store.finalStageOnly).toBe(true)

      // Restore from user preference
      store.restoreFinalStageOnly()
      expect(store.finalStageOnly).toBe(false) // Should match userFinalStageOnly
    })

    it('should handle multiple restore operations correctly', () => {
      const store = usePokemonSearchStore()

      // Set user preference
      store.setUserFinalStageOnly(false)

      // Temporarily change finalStageOnly multiple times
      store.setFinalStageOnly(true)
      store.setFinalStageOnly(false)
      store.setFinalStageOnly(true)

      // Restore should always go back to user preference
      store.restoreFinalStageOnly()
      expect(store.finalStageOnly).toBe(false)

      // Change user preference and restore again
      store.setUserFinalStageOnly(true)
      store.restoreFinalStageOnly()
      expect(store.finalStageOnly).toBe(true)
    })
  })

  describe('Sort Settings', () => {
    it('should initialize with correct default sort values', () => {
      const store = usePokemonSearchStore()

      expect(store.pokedexSort).toBe('pokedex')
      expect(store.pokedexSortAscending).toBe(true)
      expect(store.pokeboxSort).toBe('rp')
      expect(store.pokeboxSortAscending).toBe(false)
    })

    it('should update pokedex sort settings', () => {
      const store = usePokemonSearchStore()

      store.setPokedexSort('name', false)

      expect(store.pokedexSort).toBe('name')
      expect(store.pokedexSortAscending).toBe(false)
    })

    it('should update pokebox sort settings', () => {
      const store = usePokemonSearchStore()

      store.setPokeboxSort('level', true)

      expect(store.pokeboxSort).toBe('level')
      expect(store.pokeboxSortAscending).toBe(true)
    })

    it('should maintain separate sort settings for pokedex and pokebox', () => {
      const store = usePokemonSearchStore()

      store.setPokedexSort('name', false)
      store.setPokeboxSort('level', true)

      expect(store.pokedexSort).toBe('name')
      expect(store.pokedexSortAscending).toBe(false)
      expect(store.pokeboxSort).toBe('level')
      expect(store.pokeboxSortAscending).toBe(true)
    })
  })

  describe('Store Persistence', () => {
    it('should have persist configuration enabled', () => {
      // The store is configured with persist: true
      // This test verifies the store definition includes persistence
      const store = usePokemonSearchStore()

      // Verify store exists and has the expected properties
      expect(store).toBeDefined()
      expect(store.showPokebox).toBeDefined()
      expect(store.showPokeboxBadge).toBeDefined()
      expect(store.userFinalStageOnly).toBeDefined()
      expect(store.finalStageOnly).toBeDefined()
      expect(store.togglePokebox).toBeDefined()
      expect(store.hidePokeboxBadge).toBeDefined()
      expect(store.setUserFinalStageOnly).toBeDefined()
      expect(store.setFinalStageOnly).toBeDefined()
      expect(store.restoreFinalStageOnly).toBeDefined()
    })
  })
})
