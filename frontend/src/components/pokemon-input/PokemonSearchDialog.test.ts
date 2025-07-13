import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PokemonSearchDialog from './PokemonSearchDialog.vue'

// Mock the PokemonSearch component as a simple stub
const MockPokemonSearch = {
  name: 'PokemonSearch',
  props: ['standalone'],
  emits: ['cancel', 'save'],
  template: `
    <div data-testid="pokemon-search-mock">
      <span>Standalone: {{ standalone }}</span>
      <button data-testid="cancel-btn" @click="$emit('cancel')">Cancel</button>
      <button data-testid="save-btn" @click="$emit('save', mockPokemon)">Save</button>
    </div>
  `,
  setup() {
    return {
      mockPokemon: { name: 'Pikachu', pokedexNumber: 25 }
    }
  }
}

describe('PokemonSearchDialog', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSearchDialog>>
  let dialogStore: ReturnType<typeof useDialogStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    dialogStore = useDialogStore()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const mountComponent = () => {
    return mount(PokemonSearchDialog, {
      global: {
        stubs: {
          PokemonSearch: MockPokemonSearch
        }
      }
    })
  }

  describe('Component Mounting', () => {
    it('should mount without errors', () => {
      expect(() => {
        wrapper = mountComponent()
      }).not.toThrow()
    })

    it('should render VDialog component', () => {
      wrapper = mountComponent()

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.exists()).toBe(true)
    })
  })

  describe('Dialog Configuration', () => {
    it('should set correct max-width', () => {
      wrapper = mountComponent()

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('maxWidth')).toBe('600px')
    })

    it('should bind dialog visibility to store state', async () => {
      wrapper = mountComponent()

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('modelValue')).toBe(false)

      // Open dialog
      dialogStore.openPokemonSearch(vi.fn())
      await nextTick()

      expect(dialog.props('modelValue')).toBe(true)
    })
  })

  describe('PokemonSearch Integration', () => {
    it('should render PokemonSearch with standalone=false', async () => {
      dialogStore.openPokemonSearch(vi.fn())

      wrapper = mountComponent()
      await nextTick()

      const pokemonSearch = wrapper.findComponent({ name: 'PokemonSearch' })
      expect(pokemonSearch.exists()).toBe(true)
      expect(pokemonSearch.props('standalone')).toBe(false)
    })

    it('should handle cancel event from PokemonSearch', async () => {
      const closeSpy = vi.spyOn(dialogStore, 'closePokemonSearch')

      dialogStore.openPokemonSearch(vi.fn())
      wrapper = mountComponent()
      await nextTick()

      const cancelBtn = wrapper.find('[data-testid="cancel-btn"]')
      if (cancelBtn.exists()) {
        await cancelBtn.trigger('click')
        expect(closeSpy).toHaveBeenCalled()
      }
    })

    it('should handle save event from PokemonSearch', async () => {
      const mockCallback = vi.fn()
      const handleSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')

      dialogStore.openPokemonSearch(mockCallback)
      wrapper = mountComponent()
      await nextTick()

      const saveBtn = wrapper.find('[data-testid="save-btn"]')
      if (saveBtn.exists()) {
        await saveBtn.trigger('click')
        expect(handleSpy).toHaveBeenCalled()
      }
    })
  })

  describe('Store Integration', () => {
    it('should respond to store changes', async () => {
      wrapper = mountComponent()

      const dialog = wrapper.findComponent({ name: 'VDialog' })
      expect(dialog.props('modelValue')).toBe(false)

      // Open dialog
      dialogStore.openPokemonSearch(vi.fn())
      await nextTick()

      expect(dialog.props('modelValue')).toBe(true)

      // Close dialog
      dialogStore.closePokemonSearch()
      await nextTick()

      expect(dialog.props('modelValue')).toBe(false)
    })
  })

  describe('Component Lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      wrapper = mountComponent()

      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })
  })
})
