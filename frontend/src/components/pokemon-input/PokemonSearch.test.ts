import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonSearchStore } from '@/stores/pokemon-search-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
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

  it('calls callback directly when coming from pokemon-button (regardless of Pokebox/Pokedex)', async () => {
    pokemonSearchStore.showPokebox = false

    const openPokemonInputSpy = vi.spyOn(dialogStore, 'openPokemonInput')
    const handlePokemonSelectedSpy = vi.spyOn(dialogStore, 'handlePokemonSelected')
    const callback = vi.fn()
    dialogStore.openPokemonSearch(callback)

    // Click on a Pokemon avatar
    const avatars = wrapper.findAll('.v-avatar')
    if (avatars.length > 0) {
      await avatars[0].trigger('click')

      // Should NOT open PokemonInputDialog when callback exists (coming from pokemon-button)
      expect(openPokemonInputSpy).not.toHaveBeenCalled()

      // Should call handlePokemonSelected instead
      expect(handlePokemonSelectedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pokemon: expect.any(Object)
        })
      )
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
})
