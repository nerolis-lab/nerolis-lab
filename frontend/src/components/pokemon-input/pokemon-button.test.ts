import PokemonButton from '@/components/pokemon-input/pokemon-button.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { ABOMASNOW } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/stores/pokedex-store/pokedex-store', () => ({
  usePokedexStore: () => ({
    groupedPokedex: [
      {
        category: 'ingredient',
        list: ['Bulbasaur', 'Charmander', 'Squirtle']
      },
      {
        category: 'berry',
        list: ['Pikachu', 'Raichu']
      },
      {
        category: 'skill',
        list: ['Machop', 'Machoke', 'Machamp']
      }
    ]
  })
}))

const mockOpenPokemonSearch = vi.fn()

vi.mock('@/stores/dialog-store/dialog-store', () => ({
  useDialogStore: () => ({
    openPokemonSearch: mockOpenPokemonSearch
  })
}))

describe('PokemonButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonButton>>

  beforeEach(() => {
    vi.clearAllMocks()
    const mockPokemon = mocks.createMockPokemon({ pokemon: ABOMASNOW })
    wrapper = mount(PokemonButton, {
      props: {
        pokemonInstance: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with no Pokémon selected', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/abomasnow.png')
  })

  it('renders correctly with a Pokémon selected', async () => {
    const mockPokemon = mocks.createMockPokemon()
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })

  it('opens pokemon search dialog on button click', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(mockOpenPokemonSearch).toHaveBeenCalledTimes(1)
    expect(mockOpenPokemonSearch).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        pokemon: ABOMASNOW
      })
    )
  })

  it('calls dialog store with current pokemon instance', async () => {
    const mockPokemon = mocks.createMockPokemon({ pokemon: ABOMASNOW })
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(mockOpenPokemonSearch).toHaveBeenCalledWith(expect.any(Function), mockPokemon)
  })

  it('displays Pokémon image correctly', async () => {
    const mockPokemon = mocks.createMockPokemon()
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })

  it('emits update-pokemon when callback is executed', async () => {
    const mockPokemon = mocks.createMockPokemon({ pokemon: ABOMASNOW })
    const button = wrapper.find('button')
    await button.trigger('click')

    // Get the callback function that was passed to openPokemonSearch
    const callback = mockOpenPokemonSearch.mock.calls[0][0]

    // Execute the callback with a pokemon
    callback(mockPokemon)

    expect(wrapper.emitted('update-pokemon')).toBeTruthy()
    expect(wrapper.emitted('update-pokemon')![0]).toEqual([mockPokemon])
  })
})
