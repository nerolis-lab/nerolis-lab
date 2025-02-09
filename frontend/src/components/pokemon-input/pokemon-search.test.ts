import PokemonSearch from '@/components/pokemon-input/pokemon-search.vue'
import { faker } from '@faker-js/faker/locale/en'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PIKACHU, RandomUtils, uuid } from 'sleepapi-common'
import { vimic } from 'vimic'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('PokemonSearch', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSearch>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(PokemonSearch, {
      props: {
        memberIndex: 0
      }
    })

    vimic(uuid, 'v4', () => 'some uuid')
    vimic(RandomUtils, 'roll', () => true)
    vimic(faker.person, 'firstName', () => 'Some name')
  })

  it('renders GroupList when no Pokémon is selected', () => {
    expect(wrapper.findComponent({ name: 'GroupList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)
  })

  it('emits cancel event when closeMenu is called', async () => {
    wrapper.vm.closeMenu()
    await nextTick()

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('selects Pokémon correctly', async () => {
    const pkmn = PIKACHU
    wrapper.vm.selectPokemon(pkmn.name)

    await nextTick()

    expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(true)
    expect(wrapper.vm.pokemonInstance).toMatchSnapshot()
    expect(wrapper.findComponent({ name: 'PokemonInput' }).props('preSelectedPokemonInstance')).toMatchSnapshot()
  })

  it('displays error message if Pokémon is not found', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    wrapper.vm.selectPokemon('unknown')

    await nextTick()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error selecting Pokémon')
    consoleErrorSpy.mockRestore()
  })
})
