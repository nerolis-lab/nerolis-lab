import PokemonName from '@/components/pokemon-input/pokemon-name.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('PokemonName', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonName>>

  beforeEach(() => {
    const mockPokemon = mocks.createMockPokemon({ name: 'Some name' })
    wrapper = mount(PokemonName, { props: { pokemonInstance: mockPokemon } })
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
    await wrapper.setData({ isEditDialogOpen: true })

    const textField = wrapper.findComponent({ name: 'VTextField' })
    expect(textField.exists()).toBe(true)

    await textField.setValue('Pokemon123')

    expect(wrapper.vm.editedName).toBe('Pokemon123')
  })

  it('saves edited name', async () => {
    await wrapper.setData({ isEditDialogOpen: true, editedName: 'NewName' })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    expect(wrapper.emitted('update-name')).toHaveLength(1)
    expect(wrapper.emitted('update-name')![0]).toEqual(['NewName'])
    expect(wrapper.vm.isEditDialogOpen).toBe(false)
  })

  it('rerolls name correctly', async () => {
    const mockPokemon = mocks.createMockPokemon({ name: 'Bernard' })
    await wrapper.setProps({ pokemonInstance: mockPokemon })
    await wrapper.setData({ isEditDialogOpen: true })

    const rerollButton = document.querySelector('#rerollButton') as HTMLElement
    expect(rerollButton).not.toBeNull()
    rerollButton.click()

    const newName = wrapper.vm.editedName
    expect(newName).not.toBe('')
    expect(newName.length).toBeLessThanOrEqual(wrapper.vm.maxNameLength)
  })

  it('closes edit dialog on cancel', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const cancelButton = document.querySelector('#cancelButton')
    expect(cancelButton).not.toBeNull()
    ;(cancelButton as HTMLElement).click()

    expect(wrapper.vm.isEditDialogOpen).toBe(false)
  })

  it('handles remaining characters correctly', async () => {
    await wrapper.setData({ isEditDialogOpen: true, editedName: 'ShortName' })

    expect(wrapper.vm.remainingChars).toBe(wrapper.vm.maxNameLength - 'ShortName'.length)
  })

  it('does not save when remaining characters are negative', async () => {
    await wrapper.setData({
      isEditDialogOpen: true,
      editedName: 'VeryLongPokemonNameThatExceedsLimit'
    })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.hasAttribute('disabled')).toBe(true)
  })
})
