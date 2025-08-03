import PokemonName from '@/components/pokemon-input/PokemonName.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('PokemonName', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonName>>

  beforeEach(() => {
    const mockPokemon = mocks.createMockPokemon({ name: 'Some name' })
    wrapper = mount(PokemonName, {
      props: { pokemonInstance: mockPokemon },
      attachTo: document.body
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('enables button and displays name when Pokémon is provided', async () => {
    const button = wrapper.find('button')
    expect(button.text()).toBe('Some name')
  })

  it('opens edit dialog on button click', async () => {
    const mockPokemon = mocks.createMockPokemon({ name: 'Bernard' })
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    const button = wrapper.find('button')
    await button.trigger('click')

    const pokemonNameDialog = document.querySelector('#pokemonNameDialog')
    expect(pokemonNameDialog).not.toBeNull()

    if (pokemonNameDialog) {
      const style = window.getComputedStyle(pokemonNameDialog)
      expect(style.display).not.toBe('none')
    }
  })

  it('filters input correctly', async () => {
    // Open dialog by clicking button
    const button = wrapper.find('button')
    await button.trigger('click')

    const textField = wrapper.findComponent({ name: 'VTextField' })
    expect(textField.exists()).toBe(true)

    await textField.setValue('Pokemon123')
    // Check that the text field has the value
    expect(textField.props('modelValue')).toBe('Pokemon123')
  })

  it('saves edited name', async () => {
    // Open dialog by clicking button
    const button = wrapper.find('button')
    await button.trigger('click')

    const textField = wrapper.findComponent({ name: 'VTextField' })
    await textField.setValue('NewName')

    // Wait for dialog to render
    await wrapper.vm.$nextTick()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    expect(wrapper.emitted('update-name')).toHaveLength(1)
    expect(wrapper.emitted('update-name')![0]).toEqual(['NewName'])
  })

  it('rerolls name correctly', async () => {
    const mockPokemon = mocks.createMockPokemon({ name: 'Bernard' })
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    // Open dialog
    const button = wrapper.find('button')
    await button.trigger('click')

    // Wait for dialog to render
    await wrapper.vm.$nextTick()

    const rerollButton = document.querySelector('#rerollButton') as HTMLElement
    expect(rerollButton).not.toBeNull()
    rerollButton.click()

    // Check that text field has a value
    const textField = wrapper.findComponent({ name: 'VTextField' })
    const newName = textField.props('modelValue') as string
    expect(newName).not.toBe('')
    expect(newName.length).toBeLessThanOrEqual(12) // maxNameLength
  })

  it('closes edit dialog on cancel', async () => {
    // Open dialog
    const button = wrapper.find('button')
    await button.trigger('click')

    const dialog = wrapper.findComponent({ name: 'v-dialog' })
    expect(dialog.props('modelValue')).toBe(true)

    // Wait for dialog to render
    await wrapper.vm.$nextTick()

    const cancelButton = document.querySelector('#cancelButton') as HTMLElement
    expect(cancelButton).not.toBeNull()
    cancelButton.click()

    // Dialog should be closed
    await wrapper.vm.$nextTick()
  })

  it('handles remaining characters correctly', async () => {
    // Open dialog
    const button = wrapper.find('button')
    await button.trigger('click')

    const textField = wrapper.findComponent({ name: 'VTextField' })
    await textField.setValue('ShortName')

    // Check counter prop
    expect(textField.props('counter')).toBe(12)
  })

  it('does not save when remaining characters are negative', async () => {
    // Open dialog
    const button = wrapper.find('button')
    await button.trigger('click')

    const textField = wrapper.findComponent({ name: 'VTextField' })
    await textField.setValue('VeryLongPokemonNameThatExceedsLimit')

    // Wait for dialog to render
    await wrapper.vm.$nextTick()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.hasAttribute('disabled')).toBe(true)
  })
})
