import GameSettings from '@/components/settings/game-settings/game-settings.vue'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import {
  commonMocks,
  delay,
  ISLANDS,
  MAX_ISLAND_BONUS,
  MAX_POT_SIZE,
  MIN_POT_SIZE,
  type IslandShortName
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    upsertAreaBonus: vi.fn().mockResolvedValue(undefined),
    upsertUserSettings: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('GameSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof GameSettings>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.areaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<
      IslandShortName,
      number
    >
    userStore.setInitialLoginData(commonMocks.loginResponse())

    wrapper = mount(GameSettings)
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)

    ISLANDS.forEach((island) => {
      expect(wrapper.text()).toContain(island.name)
    })

    expect(wrapper.text()).toContain('Recipe Bonus')
    expect(wrapper.text()).toContain('Pot Size')

    const recipesLink = wrapper.find('a[href="/recipes"]')
    expect(recipesLink.exists()).toBe(true)
    expect(recipesLink.text()).toBe('Recipes')

    // Check for pot size control buttons
    const buttons = wrapper.findAll('button')
    expect(buttons.some((btn) => btn.text().includes('Min'))).toBe(true)
    expect(buttons.some((btn) => btn.text().includes('Max'))).toBe(true)
    expect(wrapper.find('.mdi-minus')).toBeTruthy()
    expect(wrapper.find('.mdi-plus')).toBeTruthy()
  })

  it('displays informational text about calculations', () => {
    const infoText = wrapper.find('.fine-print')
    expect(infoText.exists()).toBe(true)
    expect(infoText.text()).toContain(
      'Calculations will use this as your baseline and apply any relevant bonuses, such as Good Camp Tickets or Pokémon skills, on top of this.'
    )
  })

  it('uses number inputs for each island with correct initial values', () => {
    const numberInputs = wrapper
      .findAllComponents({ name: 'NumberInput' })
      .filter((input) => input.props('suffix') === '%')

    expect(numberInputs.length).toBe(ISLANDS.length)

    numberInputs.forEach((input) => {
      expect(input.props('min')).toBe(0)
      expect(input.props('max')).toBe(75)
    })
  })

  it('has a pot size input with correct initial values', () => {
    const potSizeInput = wrapper
      .findAllComponents({ name: 'NumberInput' })
      .filter((input) => !input.props('suffix'))
      .at(0)

    expect(potSizeInput).toBeDefined()
    expect(potSizeInput?.props('min')).toBe(MIN_POT_SIZE)
    expect(potSizeInput?.props('max')).toBe(MAX_POT_SIZE)
  })

  it('calls UserService.upsertAreaBonus when area bonus is updated', async () => {
    const firstIsland = ISLANDS[0].shortName

    const firstInput = wrapper
      .findAllComponents({ name: 'NumberInput' })
      .filter((input) => input.props('max') === MAX_ISLAND_BONUS && input.props('min') === 0)[0]

    await firstInput.setValue(10)
    await firstInput.vm.$emit('update-number')

    expect(UserService.upsertAreaBonus).toHaveBeenCalledWith(firstIsland, userStore.areaBonus[firstIsland])
  })

  describe('pot size controls', () => {
    it('increases pot size by 3 when plus button is clicked', async () => {
      userStore.potSize = 30
      const plusButton = wrapper.find('button:has(.mdi-plus)')
      await plusButton.trigger('click')
      expect(userStore.potSize).toBe(33)
    })

    it('decreases pot size by 3 when minus button is clicked', async () => {
      userStore.potSize = 30
      const minusButton = wrapper.find('button:has(.mdi-minus)')
      await minusButton.trigger('click')
      expect(userStore.potSize).toBe(27)
    })

    it('sets pot size to minimum when Min button is clicked', async () => {
      userStore.potSize = 30
      const minButton = wrapper.findAll('button').find((btn) => btn.text().includes('Min'))
      await minButton?.trigger('click')
      expect(userStore.potSize).toBe(MIN_POT_SIZE)
    })

    it('sets pot size to maximum when Max button is clicked', async () => {
      userStore.potSize = 30
      const maxButton = wrapper.findAll('button').find((btn) => btn.text().includes('Max'))
      await maxButton?.trigger('click')
      expect(userStore.potSize).toBe(MAX_POT_SIZE)
    })

    it('does not increase pot size beyond maximum', async () => {
      userStore.potSize = MAX_POT_SIZE
      const plusButton = wrapper.find('button:has(.mdi-plus)')
      await plusButton.trigger('click')
      expect(userStore.potSize).toBe(MAX_POT_SIZE)
    })

    it('does not decrease pot size below minimum', async () => {
      userStore.potSize = MIN_POT_SIZE
      const minusButton = wrapper.find('button:has(.mdi-minus)')
      await minusButton.trigger('click')
      expect(userStore.potSize).toBe(MIN_POT_SIZE)
    })
  })

  describe('pot size debouncing', () => {
    it('debounces API calls when updating pot size', async () => {
      userStore.potSize = 30
      const plusButton = wrapper.find('button:has(.mdi-plus)')

      // Trigger multiple updates in quick succession
      await plusButton.trigger('click') // 33
      await plusButton.trigger('click') // 36
      await plusButton.trigger('click') // 39
      await wrapper.vm.$nextTick()

      // API should not be called immediately
      expect(UserService.upsertUserSettings).not.toHaveBeenCalled()

      // Fast-forward time by 1000ms (debounce delay)
      vi.advanceTimersByTime(1000)

      // API should be called once with the final value
      expect(UserService.upsertUserSettings).toHaveBeenCalledTimes(1)
      expect(UserService.upsertUserSettings).toHaveBeenCalledWith({ potSize: 39 })
    })

    it('cancels pending debounced calls when unmounted', async () => {
      userStore.potSize = 30
      const plusButton = wrapper.find('button:has(.mdi-plus)')
      await plusButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Clear any immediate calls
      vi.clearAllMocks()
      vi.clearAllTimers()

      // Unmount before the debounce timer fires
      wrapper.unmount()

      // Fast-forward time by 1000ms
      vi.advanceTimersByTime(1000)

      expect(UserService.upsertUserSettings).not.toHaveBeenCalled()
    })
  })

  it('sets loading state during API call', async () => {
    vi.mocked(UserService.upsertAreaBonus).mockImplementationOnce(async () => {
      await delay(100)
      return { area: ISLANDS[0].shortName, bonus: 10 }
    })

    const firstInput = wrapper
      .findAllComponents({ name: 'NumberInput' })
      .filter((input) => input.props('max') === MAX_ISLAND_BONUS && input.props('min') === 0)[0]

    await firstInput.setValue(10)
    await firstInput.trigger('change')
    await wrapper.vm.$nextTick()

    const loadingEl = wrapper.find('.v-progress-linear')
    expect(loadingEl.exists()).toBe(true)
    expect(loadingEl.isVisible()).toBe(true)

    vi.advanceTimersByTime(100)
  }, 10000)

  it('sets loading state during pot size API call', async () => {
    vi.mocked(UserService.upsertUserSettings).mockImplementationOnce(async () => {
      await delay(100)
      return { potSize: 33 }
    })

    const potSizeInput = wrapper.find('input[type="number"]:not([suffix])')
    await potSizeInput.setValue(33)
    await potSizeInput.trigger('change')
    await wrapper.vm.$nextTick()

    const loadingEl = wrapper.find('.v-progress-linear')
    expect(loadingEl.exists()).toBe(true)
    expect(loadingEl.isVisible()).toBe(true)

    vi.advanceTimersByTime(100)
  }, 10000)
})
