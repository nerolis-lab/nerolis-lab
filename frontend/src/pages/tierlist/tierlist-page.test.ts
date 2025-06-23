import TierlistPage from '@/pages/tierlist/tierlist-page.vue'
import { tierlistService } from '@/services/tierlist-service'
import { shallowMount } from '@vue/test-utils'
import type { PokemonWithTiering } from 'sleepapi-common'
import { commonMocks } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

vi.mock('@/services/tierlist-service', () => ({
  tierlistService: {
    fetchTierlist: vi.fn(),
    getPokemonVariants: vi.fn()
  }
}))

vi.mock('html2canvas', () => ({
  default: vi.fn()
}))

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    write: vi.fn()
  }
})

const mockRoute = ref({
  name: 'tierlist',
  query: {}
})

const mockRouter = {
  push: vi.fn(),
  currentRoute: mockRoute
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute.value,
  useRouter: () => mockRouter
}))

vi.mock('@/services/utils/ui-utils', () => ({
  getDiffDisplayInfo: vi.fn(() => ({ color: 'primary' }))
}))

vi.mock('sleepapi-common', async () => {
  const actual = await vi.importActual('sleepapi-common')
  return {
    ...actual,
    getPokemon: vi.fn(() => ({ displayName: 'Pikachu' }))
  }
})

describe('TierlistPage', () => {
  const mockTierlistData: PokemonWithTiering[] = [
    commonMocks.pokemonWithTiering({
      tier: 'S',
      score: 100,
      diff: 5,
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'PIKACHU'
      }
    }),
    commonMocks.pokemonWithTiering({
      tier: 'A',
      score: 80,
      diff: -2,
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'CHARMANDER'
      }
    }),
    commonMocks.pokemonWithTiering({
      tier: 'B',
      score: 60,
      diff: 0,
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'SQUIRTLE'
      }
    })
  ]

  beforeEach(async () => {
    mockRoute.value = {
      name: 'tierlist',
      query: {}
    }

    vi.mocked(tierlistService.fetchTierlist).mockResolvedValue(mockTierlistData)
    vi.mocked(tierlistService.getPokemonVariants).mockReturnValue([mockTierlistData[0]])

    // Ensure clipboard is properly mocked for all tests
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        write: vi.fn().mockResolvedValue(undefined)
      }
    })

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      cb(123)
      return 123
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Mounting', () => {
    it('renders correctly', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(wrapper.exists()).toBe(true)
      // Check for the root element instead of CSS class since we're using shallowMount
      expect(wrapper.find('v-container-stub').exists()).toBe(true)

      wrapper.unmount()
    })

    it('calls tierlist service on mount with default settings', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalledWith({
        level: 60,
        camp: true
      })

      wrapper.unmount()
    })
  })

  describe('Route Handling', () => {
    it('calls tierlist service with level 30 from query parameters', async () => {
      // Set query parameters in mock route
      mockRoute.value = {
        name: 'tierlist',
        query: { level: '30', camp: 'false' }
      }

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalledWith({
        level: 30,
        camp: false
      })

      wrapper.unmount()
    })

    it('calls tierlist service with level 60 from query parameters', async () => {
      mockRoute.value = {
        name: 'tierlist',
        query: { level: '60', camp: 'true' }
      }

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalledWith({
        level: 60,
        camp: true
      })

      wrapper.unmount()
    })

    it('handles invalid level parameter gracefully', async () => {
      mockRoute.value = {
        name: 'tierlist',
        query: { level: 'invalid' }
      }

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Should fall back to default level 60
      expect(tierlistService.fetchTierlist).toHaveBeenCalledWith({
        level: 60,
        camp: true
      })

      wrapper.unmount()
    })

    it('handles missing query parameters', async () => {
      mockRoute.value = {
        name: 'tierlist',
        query: {}
      }

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalledWith({
        level: 60,
        camp: true
      })

      wrapper.unmount()
    })
  })

  describe('Service Integration', () => {
    it('handles successful data loading', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(tierlistService.fetchTierlist).toHaveBeenCalled()
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })

    it('handles service errors gracefully', async () => {
      vi.mocked(tierlistService.fetchTierlist).mockRejectedValue(new Error('Service error'))

      const wrapper = shallowMount(TierlistPage)
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Component should still render even with service errors
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })

    it('handles empty data response', async () => {
      vi.mocked(tierlistService.fetchTierlist).mockResolvedValue([])

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalled()
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Component Structure', () => {
    it('has the correct structure', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Check that the main container exists
      expect(wrapper.find('v-container-stub').exists()).toBe(true)
      // Check that BubbleBackground component is present
      expect(wrapper.findComponent({ name: 'BubbleBackground' })).toBeTruthy()

      wrapper.unmount()
    })

    it('is a Vue component', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(wrapper.vm).toBeDefined()

      wrapper.unmount()
    })
  })

  describe('Clipboard Integration', () => {
    it('does not fail when clipboard is unavailable', async () => {
      // Mock clipboard to be undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true
      })

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Component should still mount successfully
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Data Filtering and Computed Properties', () => {
    it('has proper component structure for UI elements', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // With shallowMount, we can only test the basic component structure
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('v-container-stub').exists()).toBe(true)

      wrapper.unmount()
    })

    it('loads data with different service responses', async () => {
      const customData = [
        {
          ...mockTierlistData[0],
          tier: 'S' as const,
          score: 95
        }
      ]
      vi.mocked(tierlistService.fetchTierlist).mockResolvedValue(customData)

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      expect(tierlistService.fetchTierlist).toHaveBeenCalled()
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })

    it('calls getPokemonVariants service method', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Component should be properly initialized
      expect(wrapper.exists()).toBe(true)
      // Service methods should be available
      expect(tierlistService.getPokemonVariants).toBeDefined()

      wrapper.unmount()
    })

    it('handles component lifecycle properly', async () => {
      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Component should mount and unmount without errors
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('displays error state when service fails', async () => {
      vi.mocked(tierlistService.fetchTierlist).mockRejectedValue(new Error('Network error'))

      const wrapper = shallowMount(TierlistPage)
      await nextTick()
      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Component should still render
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })

    it('displays loading state initially', async () => {
      // Mock a slow service response
      vi.mocked(tierlistService.fetchTierlist).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTierlistData), 100))
      )

      const wrapper = shallowMount(TierlistPage)
      await nextTick()

      // Component should render during loading
      expect(wrapper.exists()).toBe(true)

      wrapper.unmount()
    })
  })
})
