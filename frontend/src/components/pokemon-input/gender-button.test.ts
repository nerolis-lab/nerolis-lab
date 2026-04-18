import GenderButton from '@/components/pokemon-input/gender-button.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { KANGASKHAN } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('GenderButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof GenderButton>>

  beforeEach(() => {
    wrapper = mount(GenderButton, {
      props: {
        pokemonInstance: mocks.createMockPokemon()
      }
    })
  })

  it('renders male icon when gender is male', async () => {
    const mockPokemonInstance = mocks.createMockPokemon({ gender: 'male' })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const icon = wrapper.find('i.mdi-gender-male')
    expect(icon.exists()).toBe(true)
    expect(icon.isVisible()).toBe(true)
  })

  it('renders female icon when gender is female', async () => {
    const mockPokemonInstance = mocks.createMockPokemon({ gender: 'female' })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const icon = wrapper.find('i.mdi-gender-female')
    expect(icon.exists()).toBe(true)
    expect(icon.isVisible()).toBe(true)
  })

  it('toggles gender and emits update-gender event', async () => {
    await wrapper.setProps({
      pokemonInstance: mocks.createMockPokemon({ gender: 'male' })
    })

    const button = wrapper.find('.v-btn')
    await button.trigger('click')

    expect(wrapper.emitted('update-gender')).toBeTruthy()
    expect(wrapper.emitted('update-gender')?.[0]).toEqual(['female'])

    await wrapper.setProps({
      pokemonInstance: mocks.createMockPokemon({ gender: 'female' })
    })

    await button.trigger('click')
    expect(wrapper.emitted('update-gender')?.[1]).toEqual(['male'])
  })

  it('does not render the button if gender is undefined', async () => {
    const mockPokemonInstance = mocks.createMockPokemon({ gender: undefined })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const button = wrapper.find('.v-btn')
    expect(button.exists()).toBe(false)
  })

  it('clamps gender to female for female-only species', async () => {
    await wrapper.setProps({
      pokemonInstance: mocks.createMockPokemon({ pokemon: KANGASKHAN, gender: 'male' })
    })
    await flushPromises()
    expect(wrapper.emitted('update-gender')?.[0]).toEqual(['female'])
  })

  it('disables toggle for female-only species without emitting on click', async () => {
    await wrapper.setProps({
      pokemonInstance: mocks.createMockPokemon({ pokemon: KANGASKHAN, gender: 'female' })
    })
    await flushPromises()
    const button = wrapper.find('.v-btn')
    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('click')
    expect(wrapper.emitted('update-gender')).toBeUndefined()
  })
})
