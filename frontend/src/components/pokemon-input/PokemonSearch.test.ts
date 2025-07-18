import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonSearchStore } from '@/stores/pokemon-search-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { BULBASAUR, COMPLETE_POKEDEX, ingredient } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getUserPokemon: vi.fn().mockResolvedValue([])
  }
}))

describe('PokemonSearch', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSearch>>
  let dialogStore: ReturnType<typeof useDialogStore>
  let pokemonSearchStore: ReturnType<typeof usePokemonSearchStore>

  beforeEach(() => {
    dialogStore = useDialogStore()
    pokemonSearchStore = usePokemonSearchStore()

    dialogStore.pokemonSearchDialog = true

    wrapper = mount(PokemonSearch)
  })

  afterEach(() => {
    wrapper.unmount()
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

  it('calls callback when Pokemon is selected from Pokebox', async () => {
    pokemonSearchStore.showPokebox = true

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

  it('calls callback directly when coming from pokemon-button with current instance', async () => {
    pokemonSearchStore.showPokebox = false

    const openPokemonInputSpy = vi.spyOn(dialogStore, 'openPokemonInput')
    const handlePokemonSelectedSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')
    const callback = vi.fn()

    // Simulate pokemon-button scenario with current instance
    const mockCurrentInstance = PokemonInstanceUtils.createDefaultPokemonInstance(COMPLETE_POKEDEX[0])
    mockCurrentInstance.level = 25
    dialogStore.openPokemonSearch(callback, mockCurrentInstance)

    // Click on a Pokemon avatar
    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')

      // Should NOT open PokemonInputDialog when callback exists with current instance (pokemon-button)
      expect(openPokemonInputSpy).not.toHaveBeenCalled()

      // Should call handlePokemonSelected instead
      expect(handlePokemonSelectedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pokemon: expect.any(Object)
        })
      )
    }
  })

  it('opens PokemonInputDialog when coming from team slot (callback but no current instance)', async () => {
    pokemonSearchStore.showPokebox = false

    const openPokemonInputSpy = vi.spyOn(dialogStore, 'openPokemonInput')
    const handlePokemonSelectedSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')
    const callback = vi.fn()

    // Simulate team slot scenario - callback but no current instance
    dialogStore.openPokemonSearch(callback) // No second parameter = no current instance

    // Click on a Pokemon avatar
    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')

      // Should open PokemonInputDialog when callback exists but no current instance (team slot)
      expect(openPokemonInputSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          pokemon: expect.any(Object)
        })
      )

      // Should NOT call handlePokemonSelected directly
      expect(handlePokemonSelectedSpy).not.toHaveBeenCalled()
    }
  })

  it('opens PokemonInputDialog when selecting from Pokedex without callback', async () => {
    pokemonSearchStore.showPokebox = false
    dialogStore.pokemonSearchCallback = null

    const openPokemonInputSpy = vi.spyOn(dialogStore, 'openPokemonInput')
    const handlePokemonSelectedSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')

    // Click on a Pokemon avatar
    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')

      // Should open PokemonInputDialog when no callback exists
      expect(openPokemonInputSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          pokemon: expect.any(Object)
        })
      )

      // Should NOT call handlePokemonSelected directly
      expect(handlePokemonSelectedSpy).not.toHaveBeenCalled()
    }
  })

  it('emits directly when selecting from Pokebox', async () => {
    pokemonSearchStore.showPokebox = true

    const handlePokemonSelectedSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')
    const callback = vi.fn()
    dialogStore.openPokemonSearch(callback)

    // Click on a Pokemon avatar
    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')

      // Should handle selection directly
      expect(handlePokemonSelectedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pokemon: expect.any(Object)
        })
      )
    }
  })

  it('toggles between Pokebox and Pokedex view', async () => {
    const pokeboxButton = wrapper.find('v-btn[title*="Pokebox"]')

    // Initially showing Pokedex
    expect(pokemonSearchStore.showPokebox).toBe(false)

    // Click pokebox button
    if (pokeboxButton.exists()) {
      await pokeboxButton.trigger('click')
      expect(pokemonSearchStore.showPokebox).toBe(true)
    }
  })

  it('filters Pokemon by both displayName and instance name', async () => {
    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('Pikachu')

    const pikachuResults = wrapper.findAll('.v-avatar')
    expect(pikachuResults.length).toBeGreaterThan(0)

    await searchInput.setValue('')

    await searchInput.setValue('chu')

    const partialResults = wrapper.findAll('.v-avatar')
    expect(partialResults.length).toBeGreaterThan(0)

    await searchInput.setValue('PIKACHU')

    const caseInsensitiveResults = wrapper.findAll('.v-avatar')
    expect(caseInsensitiveResults.length).toBeGreaterThan(0)

    await searchInput.setValue('NonExistentPokemon')

    const noResults = wrapper.findAll('.v-avatar')
    expect(noResults.length).toBe(0)
  })

  it('nameFilter function tests both pokemon displayName and instance name', () => {
    const mockPokemonWithPath = [
      {
        pokemon: { displayName: 'Charizard' },
        instance: { name: 'Thunder' },
        path: 'test-path'
      },
      {
        pokemon: { displayName: 'Bulbasaur' },
        instance: { name: 'Sparky' },
        path: 'test-path'
      },
      {
        pokemon: { displayName: 'Pikachu' },
        instance: { name: 'Lightning Bolt' },
        path: 'test-path'
      }
    ]

    const createNameFilter = (query: string) => (p: (typeof mockPokemonWithPath)[0]) =>
      !query || p.pokemon.displayName.toLowerCase().includes(query) || p.instance.name.toLowerCase().includes(query)

    let nameFilter = createNameFilter('charizard')
    let filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(1)
    expect(filtered[0].pokemon.displayName).toBe('Charizard')

    nameFilter = createNameFilter('thunder')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(1)
    expect(filtered[0].instance.name).toBe('Thunder')

    nameFilter = createNameFilter('spark')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(1)
    expect(filtered[0].instance.name).toBe('Sparky')

    nameFilter = createNameFilter('pika')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(1)
    expect(filtered[0].pokemon.displayName).toBe('Pikachu')

    nameFilter = createNameFilter('lightning')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(1)
    expect(filtered[0].instance.name).toBe('Lightning Bolt')

    nameFilter = createNameFilter('nonexistent')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(0)

    nameFilter = createNameFilter('')
    filtered = mockPokemonWithPath.filter(nameFilter)
    expect(filtered.length).toBe(3)
  })

  describe('Final Stage Only Functionality', () => {
    it('should initialize finalStageOnly from store', () => {
      const store = usePokemonSearchStore()
      store.userFinalStageOnly = true
      store.finalStageOnly = true

      const wrapper = mount(PokemonSearch)

      const checkbox = wrapper.find('input[type="checkbox"]')
      if (checkbox.exists()) {
        expect((checkbox.element as HTMLInputElement).checked).toBe(true)
      }
    })

    it('should uncheck finalStageOnly when user starts typing', async () => {
      const store = usePokemonSearchStore()
      store.userFinalStageOnly = true
      store.finalStageOnly = true

      const wrapper = mount(PokemonSearch)

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('bulba')
      await nextTick()

      expect(store.finalStageOnly).toBe(false)
      expect(store.userFinalStageOnly).toBe(true) // Should remain unchanged, this indicates that the user did not manually uncheck and thus wants to see final stages only next time again
    })

    it('should restore finalStageOnly when search is cleared', async () => {
      const store = usePokemonSearchStore()
      store.userFinalStageOnly = true
      store.finalStageOnly = true

      const wrapper = mount(PokemonSearch)

      const searchInput = wrapper.find('input[type="text"]')

      // Type something to uncheck
      await searchInput.setValue('bulba')
      await nextTick()
      expect(store.finalStageOnly).toBe(false)

      // Clear search to restore
      await searchInput.setValue('')
      await nextTick()
      expect(store.finalStageOnly).toBe(true)
    })

    it('should update persistent preference when checkbox is manually toggled', async () => {
      const store = usePokemonSearchStore()
      store.userFinalStageOnly = true
      store.finalStageOnly = true

      const wrapper = mount(PokemonSearch)

      const checkbox = wrapper.find('input[type="checkbox"]')
      if (checkbox.exists()) {
        await checkbox.setValue(false)
        await nextTick()

        expect(store.userFinalStageOnly).toBe(false)
        expect(store.finalStageOnly).toBe(false)
      }
    })
  })

  describe('Exact Ingredient Matching', () => {
    it('should find Pokemon by exact ingredient match', async () => {
      const wrapper = mount(PokemonSearch)

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue(ingredient.HONEY.name)
      await nextTick()

      // Should find Pokemon that produce honey (like Bulbasaur, Pinsir, etc.)
      const pokemonResults = wrapper.findAll('.v-avatar')

      const allIngredientProducers = COMPLETE_POKEDEX.filter(
        (p) =>
          p.ingredient0.some((i) => i.ingredient.name === ingredient.HONEY.name) ||
          p.ingredient30.some((i) => i.ingredient.name === ingredient.HONEY.name) ||
          p.ingredient60.some((i) => i.ingredient.name === ingredient.HONEY.name)
      )
      expect(pokemonResults.length).toBe(allIngredientProducers.length)

      // Verify Bulbasaur is in the results (we confirmed Bulbasaur produces honey)
      // Check if any of the avatar images contain 'bulbasaur' in their src
      // The avatarImage function generates paths like /images/pokemon/{pokemonName}.png
      const allAvatars = wrapper.findAll('.v-avatar')
      const bulbasaurFound = allAvatars.some((avatar) => {
        const img = avatar.find('img')
        if (img.exists()) {
          const src = img.attributes('src') || ''
          return src.toLowerCase().includes(BULBASAUR.name.toLowerCase())
        }
        return false
      })

      expect(bulbasaurFound).toBe(true)
    })

    it('should not find Pokemon by partial ingredient match', async () => {
      const wrapper = mount(PokemonSearch)

      // First, test that 'honey' returns results
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue(ingredient.HONEY.name)
      await nextTick()
      const honeyResults = wrapper.findAll('.v-avatar')
      const honeyCount = honeyResults.length

      // Now test that 'hon' returns different (fewer) results
      await searchInput.setValue('hon') // Partial match
      await nextTick()
      const partialResults = wrapper.findAll('.v-avatar')

      // Should have different results - 'hon' should not match honey ingredient
      expect(partialResults.length).toBeLessThan(honeyCount)
    })

    it('should match both short and long ingredient names', async () => {
      const wrapper = mount(PokemonSearch)

      // Test with an ingredient that has different short and long names
      const searchInput = wrapper.find('input[type="text"]')

      // First search by short name
      await searchInput.setValue(ingredient.SNOOZY_TOMATO.name.toLowerCase())
      await nextTick()
      const shortNameResults = wrapper.findAll('.v-avatar')
      expect(shortNameResults.length).toBeGreaterThan(0)

      // Then search by long name (should give same results)
      await searchInput.setValue(ingredient.SNOOZY_TOMATO.longName.toLowerCase())
      await nextTick()
      const longNameResults = wrapper.findAll('.v-avatar')

      expect(longNameResults.length).toBe(shortNameResults.length)
    })
  })
})
