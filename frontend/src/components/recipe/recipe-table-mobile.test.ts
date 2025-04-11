import RecipeTableMobile from '@/components/recipe/recipe-table-mobile.vue'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks, localizeNumber } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('@/composables/highlight-text/use-highlight-text', () => ({
  useHighlightText: () => ({ highlightText: vi.fn() })
}))
vi.mock('@/services/utils/image-utils', () => ({
  ingredientImage: vi.fn((name: string) => `/mocked/path/${name}.png`),
  recipeImage: vi.fn((name: string) => `/mocked/path/${name}.png`)
}))

describe('RecipeTableMobile (Card Layout)', () => {
  let wrapper: VueWrapper<InstanceType<typeof RecipeTableMobile>>

  const mockRecipes: UserRecipe[] = [
    {
      ...commonMocks.mockRecipe({
        ingredients: [
          commonMocks.mockIngredientSet({ ingredient: commonMocks.mockIngredient({ name: 'Berry' }), amount: 2 }),
          commonMocks.mockIngredientSet({ ingredient: commonMocks.mockIngredient({ name: 'Honey' }), amount: 1 })
        ],
        displayName: 'Mocked Dish',
        nrOfIngredients: 3,
        bonus: 15
      }),
      userStrength: 100,
      level: 5
    }
  ]

  beforeEach(() => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    wrapper = mount(RecipeTableMobile, {
      props: {
        recipes: mockRecipes
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays recipe information correctly', () => {
    expect(wrapper.text()).toContain('Mocked Dish')
    expect(wrapper.text()).toContain(localizeNumber(100)) // Strength
    expect(wrapper.text()).toContain('3 ingredients')
    expect(wrapper.text()).toContain('15% bonus')
  })

  it('renders ingredient icons with amounts', () => {
    const ingredientImages = wrapper.findAll('img')
    expect(ingredientImages.some((img) => img.attributes('src') === '/mocked/path/Berry.png')).toBe(true)
    expect(ingredientImages.some((img) => img.attributes('src') === '/mocked/path/Honey.png')).toBe(true)
    expect(wrapper.text()).toContain('2') // Berry amount
    expect(wrapper.text()).toContain('1') // Honey amount
  })

  it('emits updateLevel when recipe level is updated', async () => {
    await wrapper.vm.onUpdateLevel(mockRecipes[0], 10)
    expect(wrapper.emitted('updateLevel')).toBeTruthy()
    expect(wrapper.emitted('updateLevel')![0]).toEqual([mockRecipes[0], 10])
  })
})
