import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ingredient, mockIngredient, type Ingredient } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

vi.mock('@/composables/viewport-composable', () => ({
  useViewport: () => ({ isMobile: false })
}))

vi.mock('@/services/utils/image-utils', () => ({
  ingredientImage: (name: string) => `/mocked/path/${name}.png`
}))

describe('IngredientSelection', () => {
  let wrapper: VueWrapper<InstanceType<typeof IngredientSelection>>
  const mockIngredients: Ingredient[] = [
    mockIngredient({ name: 'Berry' }),
    mockIngredient({ name: 'Honey' }),
    mockIngredient({ name: 'Mushroom' })
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(IngredientSelection, {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('opens and closes ingredient menu', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.vm.ingredientMenuOpen).toBe(true)

    const menu = document.querySelector('.v-menu')
    expect(menu).toBeTruthy()

    wrapper.vm.closeIngredientMenu()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.ingredientMenuOpen).toBe(false)
  })

  it('toggles ingredient selection', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    const ingredientCard = document.querySelectorAll('.grid-item')[1]
    expect(ingredientCard).toBeTruthy()

    ingredientCard!.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedIngredients).toContainEqual(ingredient.INGREDIENTS[1])

    ingredientCard!.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedIngredients).not.toContainEqual(mockIngredients[1])
  })

  it('resets ingredients when clear is clicked', async () => {
    wrapper.vm.selectedIngredients = [...mockIngredients]
    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    const clearButton = Array.from(document.querySelectorAll('button')).find(
      (btn) => btn.textContent?.trim() === 'Clear'
    )
    clearButton!.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedIngredients).toEqual([])
  })

  it('restores preselected ingredients when cancel is clicked', async () => {
    wrapper.setProps({ preSelectedIngredients: mockIngredients })
    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    const cancelButton = document.querySelector('#cancelButton')
    cancelButton!.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selectedIngredients).toEqual(mockIngredients)
  })

  it('emits updateIngredients when add is clicked', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    const addButton = document.querySelector('#addButton')
    addButton!.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('updateIngredients')).toBeTruthy()
    expect(wrapper.emitted('updateIngredients')![0][0]).toEqual(wrapper.vm.selectedIngredients)
  })
})
