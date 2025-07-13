import { createMockPokemon } from '@/vitest/mocks'
import { describe, expect, it, vi } from 'vitest'
import { useDialogStore } from './dialog-store'

describe('Dialog Store', () => {
  describe('Pokemon Search Dialog', () => {
    it('should open pokemon search dialog with callback', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()

      expect(store.pokemonSearchDialog).toBe(false)
      expect(store.pokemonSearchCallback).toBeNull()

      store.openPokemonSearch(mockCallback)

      expect(store.pokemonSearchDialog).toBe(true)
      expect(store.pokemonSearchCallback).toBe(mockCallback)
    })

    it('should close pokemon search dialog and reset state', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()

      store.openPokemonSearch(mockCallback)
      store.closePokemonSearch()

      expect(store.pokemonSearchDialog).toBe(false)
      expect(store.pokemonSearchCallback).toBeNull()
    })

    it('should handle pokemon selection and close dialog', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()
      const mockPokemonInstance = createMockPokemon()

      store.openPokemonSearch(mockCallback)
      store.handlePokemonSelected(mockPokemonInstance)

      expect(mockCallback).toHaveBeenCalledWith(mockPokemonInstance)
      expect(store.pokemonSearchDialog).toBe(false)
      expect(store.pokemonSearchCallback).toBeNull()
    })

    it('should not throw error if no callback when handling selection', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()

      expect(() => {
        store.handlePokemonSelected(mockPokemonInstance)
      }).not.toThrow()
    })
  })

  describe('Pokemon Input Dialog', () => {
    it('should open pokemon input dialog with callback and props', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()
      const mockPokemonInstance = createMockPokemon()

      expect(store.pokemonInputDialog).toBe(false)
      expect(store.pokemonInputCallback).toBeNull()
      expect(store.pokemonInputProps.preSelectedPokemonInstance).toBeNull()

      store.openPokemonInput(mockCallback, mockPokemonInstance)

      expect(store.pokemonInputDialog).toBe(true)
      expect(store.pokemonInputCallback).toBe(mockCallback)
      expect(store.pokemonInputProps.preSelectedPokemonInstance).toStrictEqual(mockPokemonInstance)
    })

    it('should close pokemon input dialog and reset state', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()
      const mockPokemonInstance = createMockPokemon()

      store.openPokemonInput(mockCallback, mockPokemonInstance)
      store.closePokemonInput()

      expect(store.pokemonInputDialog).toBe(false)
      expect(store.pokemonInputCallback).toBeNull()
      expect(store.pokemonInputProps.preSelectedPokemonInstance).toBeNull()
    })

    it('should handle pokemon input save and close dialog', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()
      const mockPokemonInstance = createMockPokemon()
      const savedPokemonInstance = createMockPokemon()

      store.openPokemonInput(mockCallback, mockPokemonInstance)
      store.savePokemonInput(savedPokemonInstance)

      expect(mockCallback).toHaveBeenCalledWith(savedPokemonInstance)
      expect(store.pokemonInputDialog).toBe(false)
      expect(store.pokemonInputCallback).toBeNull()
    })

    it('should not throw error if no callback when handling save', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()

      expect(() => {
        store.savePokemonInput(mockPokemonInstance)
      }).not.toThrow()
    })
  })

  describe('Filled Slot Dialog', () => {
    it('should open slot actions dialog with all callbacks', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()
      const callbacks = {
        onUpdate: vi.fn(),
        onDuplicate: vi.fn(),
        onToggleSaved: vi.fn(),
        onRemove: vi.fn()
      }

      expect(store.filledSlotDialog).toBe(false)
      expect(store.filledSlotProps.pokemon).toBeNull()
      expect(store.filledSlotProps.fullTeam).toBe(false)

      store.openFilledSlot(mockPokemonInstance, true, callbacks)

      expect(store.filledSlotDialog).toBe(true)
      expect(store.filledSlotProps.pokemon).toStrictEqual(mockPokemonInstance)
      expect(store.filledSlotProps.fullTeam).toBe(true)
      expect(store.filledSlotProps.onUpdate).toBe(callbacks.onUpdate)
      expect(store.filledSlotProps.onDuplicate).toBe(callbacks.onDuplicate)
      expect(store.filledSlotProps.onToggleSaved).toBe(callbacks.onToggleSaved)
      expect(store.filledSlotProps.onRemove).toBeDefined()
    })

    it('should open slot actions dialog with partial callbacks', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()
      const callbacks = {
        onUpdate: vi.fn()
      }

      store.openFilledSlot(mockPokemonInstance, false, callbacks)

      expect(store.filledSlotDialog).toBe(true)
      expect(store.filledSlotProps.pokemon).toStrictEqual(mockPokemonInstance)
      expect(store.filledSlotProps.fullTeam).toBe(false)
      expect(store.filledSlotProps.onUpdate).toBe(callbacks.onUpdate)
      expect(store.filledSlotProps.onDuplicate).toBeUndefined()
      expect(store.filledSlotProps.onToggleSaved).toBeUndefined()
      expect(store.filledSlotProps.onRemove).toBeUndefined()
    })

    it('should wrap onRemove callback to close dialog after execution', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()
      const onRemove = vi.fn()

      store.openFilledSlot(mockPokemonInstance, false, { onRemove })

      // Call the wrapped onRemove function
      store.filledSlotProps.onRemove?.()

      expect(onRemove).toHaveBeenCalled()
      expect(store.filledSlotDialog).toBe(false)
      expect(store.filledSlotProps.pokemon).toBeNull()
    })

    it('should close slot actions dialog and reset state', () => {
      const store = useDialogStore()
      const mockPokemonInstance = createMockPokemon()
      const callbacks = {
        onUpdate: vi.fn(),
        onDuplicate: vi.fn()
      }

      store.openFilledSlot(mockPokemonInstance, true, callbacks)
      store.closeFilledSlot()

      expect(store.filledSlotDialog).toBe(false)
      expect(store.filledSlotProps.pokemon).toBeNull()
      expect(store.filledSlotProps.fullTeam).toBe(false)
      expect(store.filledSlotProps.onUpdate).toBeUndefined()
    })
  })

  describe('Store Reactivity', () => {
    it('should maintain reactivity for dialog states', () => {
      const store = useDialogStore()
      const mockCallback = vi.fn()

      // Test pokemon search dialog reactivity
      expect(store.pokemonSearchDialog).toBe(false)
      store.openPokemonSearch(mockCallback)
      expect(store.pokemonSearchDialog).toBe(true)
      store.closePokemonSearch()
      expect(store.pokemonSearchDialog).toBe(false)

      // Test pokemon input dialog reactivity
      expect(store.pokemonInputDialog).toBe(false)
      store.openPokemonInput(mockCallback, createMockPokemon())
      expect(store.pokemonInputDialog).toBe(true)
      store.closePokemonInput()
      expect(store.pokemonInputDialog).toBe(false)

      // Test filled slot dialog reactivity
      expect(store.filledSlotDialog).toBe(false)
      store.openFilledSlot(createMockPokemon(), false, {})
      expect(store.filledSlotDialog).toBe(true)
      store.closeFilledSlot()
      expect(store.filledSlotDialog).toBe(false)
    })
  })
})
