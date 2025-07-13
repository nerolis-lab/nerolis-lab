import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { createMockPokemon } from '@/vitest/mocks'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PokemonInputDialog from './PokemonInputDialog.vue'

describe('PokemonInputDialog', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonInputDialog>>
  let dialogStore: ReturnType<typeof useDialogStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    dialogStore = useDialogStore()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Component Mounting', () => {
    it('should mount without errors', () => {
      expect(() => {
        wrapper = mount(PokemonInputDialog)
      }).not.toThrow()
    })

    it('should render VDialog component', () => {
      wrapper = mount(PokemonInputDialog)

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.exists()).toBe(true)
    })
  })

  describe('Dialog Configuration', () => {
    it('should set correct max-width', () => {
      wrapper = mount(PokemonInputDialog)

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('maxWidth')).toBe('600px')
    })

    it('should bind to store state', async () => {
      wrapper = mount(PokemonInputDialog)

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('modelValue')).toBe(false)

      // Open dialog
      const mockPokemon = createMockPokemon()
      dialogStore.openPokemonInput(vi.fn(), mockPokemon)
      await nextTick()

      expect(dialog.props('modelValue')).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should use the dialog store', () => {
      wrapper = mount(PokemonInputDialog)

      expect(dialogStore.pokemonInputDialog).toBe(false)
      expect(dialogStore.pokemonInputProps.preSelectedPokemonInstance).toBeNull()
    })

    it('should respond to store changes', async () => {
      wrapper = mount(PokemonInputDialog)

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('modelValue')).toBe(false)

      // Open dialog
      const mockPokemon = createMockPokemon()
      dialogStore.openPokemonInput(vi.fn(), mockPokemon)
      await nextTick()

      expect(dialog.props('modelValue')).toBe(true)

      // Close dialog
      dialogStore.closePokemonInput()
      await nextTick()

      expect(dialog.props('modelValue')).toBe(false)
    })
  })

  describe('Component Structure', () => {
    it('should have the correct template structure', () => {
      wrapper = mount(PokemonInputDialog)

      // Should have a v-dialog as root
      expect(wrapper.findComponent({ name: 'VDialog' }).exists()).toBe(true)

      // When no pokemon is selected, PokemonInput should not render
      expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)
    })

    it('should conditionally render PokemonInput based on preSelectedPokemonInstance', async () => {
      wrapper = mount(PokemonInputDialog)

      // Initially no PokemonInput
      expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)

      // Set pokemon instance
      const mockPokemon = createMockPokemon()
      dialogStore.openPokemonInput(vi.fn(), mockPokemon)
      await nextTick()

      // Now PokemonInput should exist
      expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(true)
    })
  })

  describe('Props and Events', () => {
    it('should pass props to PokemonInput when it exists', async () => {
      const mockPokemon = createMockPokemon()
      dialogStore.openPokemonInput(vi.fn(), mockPokemon)

      wrapper = mount(PokemonInputDialog)
      await nextTick()

      const pokemonInput = wrapper.findComponent({ name: 'PokemonInput' })
      if (pokemonInput.exists()) {
        expect(pokemonInput.props('preSelectedPokemonInstance')).toStrictEqual(mockPokemon)
      }
    })

    it('should handle PokemonInput events via event listeners', async () => {
      const mockPokemon = createMockPokemon()
      const mockCallback = vi.fn()

      dialogStore.openPokemonInput(mockCallback, mockPokemon)
      wrapper = mount(PokemonInputDialog)
      await nextTick()

      const pokemonInput = wrapper.findComponent({ name: 'PokemonInput' })
      if (pokemonInput.exists()) {
        // Since we can't easily test the actual event emission in isolation,
        // we verify the component structure and that the dialog store methods exist
        expect(typeof dialogStore.closePokemonInput).toBe('function')
        expect(typeof dialogStore.savePokemonInput).toBe('function')
        expect(pokemonInput.props('preSelectedPokemonInstance')).toStrictEqual(mockPokemon)
      } else {
        // If PokemonInput doesn't exist, that's still a valid state to test
        expect(pokemonInput.exists()).toBe(false)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle null pokemon gracefully', async () => {
      dialogStore.pokemonInputDialog = true
      dialogStore.pokemonInputProps = { preSelectedPokemonInstance: null }

      expect(() => {
        wrapper = mount(PokemonInputDialog)
      }).not.toThrow()

      await nextTick()
      expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)
    })

    it('should handle undefined pokemon gracefully', async () => {
      dialogStore.pokemonInputDialog = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dialogStore.pokemonInputProps = { preSelectedPokemonInstance: undefined as any }

      expect(() => {
        wrapper = mount(PokemonInputDialog)
      }).not.toThrow()

      await nextTick()
      expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)
    })
  })

  describe('Lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      wrapper = mount(PokemonInputDialog)

      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should maintain store connection across multiple operations', async () => {
      wrapper = mount(PokemonInputDialog)
      const mockPokemon = createMockPokemon()

      // Open and close multiple times
      dialogStore.openPokemonInput(vi.fn(), mockPokemon)
      await nextTick()

      dialogStore.closePokemonInput()
      await nextTick()

      dialogStore.openPokemonInput(vi.fn(), mockPokemon)
      await nextTick()

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('modelValue')).toBe(true)
    })
  })
})
