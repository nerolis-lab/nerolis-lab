import IngredientButton from '@/components/pokemon-input/IngredientButton.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import {
  commonMocks,
  GENGAR,
  ingredient,
  PIKACHU,
  PINSIR,
  type IngredientInstanceExt,
  type IngredientSet,
  type PokemonInstanceExt
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'

describe('IngredientButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof IngredientButton>>

  const mockPokemon: PokemonInstanceExt = {
    level: 60,
    pokemon: PIKACHU,
    ingredients: [] as IngredientInstanceExt[]
  } as PokemonInstanceExt

  beforeEach(() => {
    wrapper = mount(IngredientButton, {
      props: {
        ingredientLevel: 60,
        pokemonInstance: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with provided data', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: mockPokemon
    })

    const badge = wrapper.findComponent({ name: 'v-badge' })
    expect(wrapper.text()).toContain('Lv.60')

    // Check that lock icon is not shown (badge not active) since level is 60
    expect(badge.props('modelValue')).toBe(false)
  })

  it('displays ingredient image correctly', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        ingredients: [
          { ...commonMocks.mockIngredientSet(), level: 0 },
          { ...commonMocks.mockIngredientSet(), level: 30 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 60 }
        ]
      }
    })

    const avatar = wrapper.findComponent({ name: 'v-avatar' })
    expect(avatar.exists()).toBe(true)
    expect(avatar.isVisible()).toBe(true)

    const img = avatar.find('img')
    expect(img.attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays other ingredient options in the speed dial', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: PINSIR,
        ingredients: [
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 0 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 30 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 60 }
        ]
      }
    })
    // Open the speed dial by clicking the button
    const activatorBtn = wrapper.find('.v-btn')
    await activatorBtn.trigger('click')

    // Check that 2 other options are displayed
    const speedDialBtns = wrapper.findAllComponents({ name: 'v-btn' }).filter((btn) => btn.vm.$props.icon)
    expect(speedDialBtns.length).toBe(3) // including the activator button

    const ingredientBtns = speedDialBtns.slice(1)
    expect(ingredientBtns.length).toBe(2) // two options for level 60
    expect(ingredientBtns[0].find('img').attributes('src')).toBe('/images/ingredient/apple.png')
    expect(ingredientBtns[1].find('img').attributes('src')).toBe('/images/ingredient/sausage.png')
  })

  it('updates ingredient when an option is clicked', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: PINSIR,
        ingredients: [
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 0 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 30 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.HONEY }), level: 60 }
        ]
      }
    })
    // Use fake timers
    vitest.useFakeTimers()

    // Open the speed dial by clicking the button
    const activatorBtn = wrapper.find('.v-btn')
    await activatorBtn.trigger('click')
    const otherIngredientBtns = wrapper
      .findAllComponents({ name: 'v-btn' })
      .filter((btn) => btn.vm.$props.icon)
      .slice(1) // remove activator button

    expect(otherIngredientBtns).toHaveLength(2)

    await otherIngredientBtns[0].trigger('click')

    // Advance timers by 300ms
    vitest.advanceTimersByTime(300)

    const emitted = wrapper.emitted('update-ingredient') as Array<
      Array<{ ingredientSet: IngredientSet; ingredientLevel: number }>
    >

    expect(emitted).toHaveLength(1)
    const emittedEvent = emitted[0][0]

    expect(emittedEvent.ingredientSet.ingredient.name).toBe('Apple')
    expect(emittedEvent.ingredientLevel).toBe(60)

    // Clear mock timers after the test
    vitest.useRealTimers()
  })

  it('disables the button if ingredientLevel is less than 30', async () => {
    await wrapper.setProps({ ingredientLevel: 20 })
    const button = wrapper.findComponent({ name: 'v-btn' })
    expect(button.classes()).toContain('v-btn--disabled')
  })

  it('sets ingredientSet correctly based on ingredientLevel', async () => {
    await wrapper.setProps({
      ingredientLevel: 30,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: GENGAR,
        ingredients: [
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.FIERY_HERB }), level: 0 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.FIERY_HERB }), level: 30 },
          { ...commonMocks.mockIngredientSet({ ingredient: ingredient.FIERY_HERB }), level: 60 }
        ]
      }
    })
    // Check that the ingredient image is displayed correctly for level 30
    const img = wrapper.find('img#ingredientImage')
    expect(img.attributes('src')).toBe('/images/ingredient/herb.png')
  })
})
