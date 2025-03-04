import RecipeTableMobile from '@/components/recipe/recipe-table-mobile.vue'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockRecipe } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/composables/highlight-text/use-highlight-text', () => ({
  useHighlightText: () => ({ highlightText: vi.fn() })
}))
vi.mock('@/services/utils/image-utils', () => ({
  ingredientImage: vi.fn((name: string) => `/mocked/path/${name}.png`),
  recipeImage: vi.fn((name: string) => `/mocked/path/${name}.png`)
}))

describe('RecipeTableMobile', () => {
  let wrapper: VueWrapper<InstanceType<typeof RecipeTableMobile>>

  const mockRecipes: UserRecipe[] = [
    { ...mockRecipe({ displayName: 'Mocked Dish' }), userStrength: 100, level: 3, nrOfIngredients: 3, bonus: 15 }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    const userStore = useUserStore()
    userStore.setTokens({ accessToken: '', expiryDate: 0, refreshToken: '' })

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

  it('renders recipe data correctly', () => {
    expect(wrapper.text()).toContain('Mocked Dish')
    expect(wrapper.text()).toContain('100') // Strength
    expect(wrapper.text()).toContain('3') // Pot size
    expect(wrapper.text()).toContain('15%') // Bonus
  })

  it('updates recipes when prop changes', async () => {
    const newRecipes = [{ ...mockRecipes[0], name: 'Mock Recipe 2', displayName: 'New Dish', userStrength: 200 }]
    await wrapper.setProps({ recipes: newRecipes })
    expect(wrapper.text()).toContain('New Dish')
    expect(wrapper.text()).toContain('200')
  })

  it('emits updateLevel when recipe level is updated', async () => {
    await wrapper.vm.onUpdateLevel(mockRecipes[0], 10)
    expect(wrapper.emitted('updateLevel')).toBeTruthy()
    expect(wrapper.emitted('updateLevel')![0]).toEqual([mockRecipes[0], 10])
  })
})
