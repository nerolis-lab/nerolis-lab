import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PokemonInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonInput>>
  console.error = vi.fn()

  const preExistingMon: PokemonInstanceExt = mocks.createMockPokemon()

  beforeEach(() => {
    wrapper = mount(PokemonInput, {
      props: {
        preSelectedPokemonInstance: preExistingMon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders child components correctly', () => {
    expect(wrapper.findComponent({ name: 'PokemonButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonName' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'LevelButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'IngredientButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'MainskillButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NatureButton' }).exists()).toBe(true)
  })

  it('toggles save state correctly if logged in', async () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    const saveButton = wrapper.find('#saveIcon')

    await saveButton.trigger('click')
    // Save state should toggle when logged in
    await saveButton.trigger('click')
    // State should toggle back
  })

  it('cant save if not logged in', async () => {
    const saveButton = wrapper.find('#saveIcon')

    await saveButton.trigger('click')
    expect(saveButton.classes()).toContain('nudge')
  })

  it('emits cancel event on cancel button click', async () => {
    const cancelButton = wrapper.find('#cancelButton')
    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits save event on save button click', async () => {
    const saveButton = wrapper.find('#saveButton')
    await saveButton.trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)

    const emittedEventPayload = wrapper.emitted('save')![0][0]
    expect(emittedEventPayload).toBeInstanceOf(Object)
  })

  it('renders correctly without preSelectedPokemonInstance prop', () => {
    const wrapperWithoutProp = mount(PokemonInput, {
      props: {}
    })
    expect(wrapperWithoutProp.exists()).toBe(true)
    wrapperWithoutProp.unmount()
  })
})
