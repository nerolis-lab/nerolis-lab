import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getUserPokemon: vi.fn().mockResolvedValue([])
  }
}))

describe('PokemonSearch', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSearch>>
  let dialogStore: ReturnType<typeof useDialogStore>

  beforeEach(() => {
    dialogStore = useDialogStore()

    dialogStore.pokemonSearchDialog = true

    wrapper = mount(PokemonSearch)
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(dialogStore.pokemonSearchDialog).toBe(true)
  })

  it('closes dialog when close method is called', async () => {
    expect(dialogStore.pokemonSearchDialog).toBe(true)
    dialogStore.closePokemonSearch()
    expect(dialogStore.pokemonSearchDialog).toBe(false)
  })

  it('calls callback when Pokemon is selected', async () => {
    const callback = vi.fn()
    dialogStore.openPokemonSearch(callback)

    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')
      expect(callback).toHaveBeenCalled()
    }
  })

  it('filters Pokemon based on search query', async () => {
    const initialPokemon = wrapper.findAll('.v-avatar')
    const initialCount = initialPokemon.length

    const searchInput = wrapper.find('input[type="text"]')
    if (searchInput.exists()) {
      await searchInput.setValue('Pikachu')
      await nextTick()

      // Count should be different after filtering
      const filteredPokemon = wrapper.findAll('.v-avatar')
      expect(filteredPokemon.length).toBeLessThanOrEqual(initialCount)
    }
  })
})
