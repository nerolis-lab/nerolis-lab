import RecipesPage from '@/pages/recipe/recipes-page.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { RECIPES, calculateRecipeValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/composables/viewport-composable', () => ({
  useViewport: () => ({ isMobile: false, viewportWidth: 800 })
}))

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getRecipes: vi.fn().mockResolvedValue({})
  }
}))

describe('RecipesPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof RecipesPage>>
  let recipesPage: VueWrapper<InstanceType<typeof RecipesPage>>

  beforeEach(async () => {
    setActivePinia(createPinia())
    const userStore = useUserStore()
    userStore.setTokens({ accessToken: '', expiryDate: 0, refreshToken: '' })

    wrapper = mount({
      template: '<Suspense><RecipesPage /></Suspense>',
      components: { RecipesPage }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
    await flushPromises()
    recipesPage = wrapper.findComponent(RecipesPage)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('initializes user recipes with correct structure', async () => {
    expect(recipesPage.vm.userRecipes).toBeDefined()
    expect(recipesPage.vm.userRecipes.length).toBeGreaterThan(0)
    expect(recipesPage.vm.userRecipes[0]).toHaveProperty('name')
    expect(recipesPage.vm.userRecipes[0]).toHaveProperty('level')
    expect(recipesPage.vm.userRecipes[0]).toHaveProperty('userStrength')
  })

  it('filters recipes by search query', async () => {
    recipesPage.vm.searchQuery = RECIPES[0].name
    await nextTick()
    expect(recipesPage.vm.filteredRecipes.length).toBe(1)
    expect(recipesPage.vm.filteredRecipes[0].name).toBe(RECIPES[0].name)
  })

  it('updates recipe level correctly', async () => {
    const recipe = recipesPage.vm.userRecipes[0]
    recipesPage.vm.updateRecipeLevel(recipe, 10)
    expect(recipe.level).toBe(10)
    expect(recipe.userStrength).toBe(
      calculateRecipeValue({
        bonus: recipe.bonus,
        ingredients: recipe.ingredients,
        level: 10
      })
    )
  })

  it('sorts recipes correctly by userStrength', async () => {
    // Directly modifying setup state
    recipesPage.vm.selectedSort = 'value'
    await nextTick()

    const sorted = [...recipesPage.vm.filteredRecipes].sort((a, b) => b.userStrength - a.userStrength)
    expect(recipesPage.vm.filteredRecipes).toEqual(sorted)
  })
})
