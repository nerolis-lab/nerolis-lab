import type GameSettings from '@/components//settings/game-settings/game-settings.vue'
import AreaAndRecipeBonus from '@/components//settings/game-settings/game-settings.vue'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ISLANDS, type IslandShortName } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    upsertAreaBonus: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('AreaAndRecipeBonus', () => {
  let wrapper: VueWrapper<InstanceType<typeof GameSettings>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    setActivePinia(createPinia())

    userStore = useUserStore()
    userStore.areaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<
      IslandShortName,
      number
    >

    wrapper = mount(AreaAndRecipeBonus)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)

    ISLANDS.forEach((island) => {
      expect(wrapper.text()).toContain(island.name)
    })

    expect(wrapper.text()).toContain('Recipe Bonus')

    const recipesLink = wrapper.find('a[href="/recipes"]')
    expect(recipesLink.exists()).toBe(true)
    expect(recipesLink.text()).toBe('Recipes')
  })

  it('uses number inputs for each island with correct initial values', () => {
    const numberInputs = wrapper.findAllComponents({ name: 'NumberInput' })

    expect(numberInputs.length).toBe(ISLANDS.length)

    numberInputs.forEach((input) => {
      expect(input.props('min')).toBe(0)
      expect(input.props('max')).toBe(100)
    })
  })

  it('calls UserService.upsertAreaBonus when area bonus is updated', async () => {
    const firstInput = wrapper.findComponent({ name: 'NumberInput' })
    const firstIsland = ISLANDS[0].shortName

    await firstInput.vm.$emit('update-number')

    expect(UserService.upsertAreaBonus).toHaveBeenCalledWith(firstIsland, userStore.areaBonus[firstIsland])
  })

  it('sets loading state during API call', async () => {
    const delay = new Promise((resolve) => setTimeout(resolve, 100))
    vi.mocked(UserService.upsertAreaBonus).mockImplementationOnce(async () => {
      await delay
      return {
        area: ISLANDS[0].shortName,
        bonus: userStore.areaBonus[ISLANDS[0].shortName]
      }
    })

    const firstInput = wrapper.findComponent({ name: 'NumberInput' })

    const updatePromise = firstInput.vm.$emit('update-number')

    await vi.waitFor(() => {
      const loadingProps = wrapper.findComponent({ name: 'NumberInput' }).props('loading')
      expect(loadingProps).toBe(true)
    })

    await updatePromise

    await vi.waitFor(() => {
      const loadingProps = wrapper.findComponent({ name: 'NumberInput' }).props('loading')
      expect(loadingProps).toBe(false)
    })
  })
})
