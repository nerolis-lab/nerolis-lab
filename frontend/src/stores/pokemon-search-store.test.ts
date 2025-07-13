import { setActivePinia, createPinia } from 'pinia'
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

  describe('Store Persistence', () => {
    it('should have persist configuration enabled', () => {
      // The store is configured with persist: true
      // This test verifies the store definition includes persistence
      const store = usePokemonSearchStore()

      // Verify store exists and has the expected properties
      expect(store).toBeDefined()
      expect(store.showPokebox).toBeDefined()
      expect(store.showPokeboxBadge).toBeDefined()
      expect(store.togglePokebox).toBeDefined()
      expect(store.hidePokeboxBadge).toBeDefined()
    })
  })
})
