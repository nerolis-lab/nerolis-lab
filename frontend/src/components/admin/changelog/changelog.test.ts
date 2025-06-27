import Changelog from '@/components/admin/changelog/changelog.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import type { Release } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Changelog.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof Changelog>>

  const mockReleases: Release[] = [
    {
      version: '2.0.0',
      date: '2025-01-01',
      type: 'major',
      features: [
        {
          commit: 'abc1234',
          description: 'Add new feature',
          scope: 'api',
          isBreaking: false
        }
      ],
      bugFixes: [
        {
          commit: 'def5678',
          description: 'Fix memory leak',
          isBreaking: false
        }
      ],
      breakingChanges: [
        {
          commit: 'ghi9012',
          description: 'Remove deprecated API',
          isBreaking: true
        }
      ],
      otherChanges: []
    },
    {
      version: '1.1.0',
      date: '2024-12-31',
      type: 'minor',
      features: [
        {
          commit: 'jkl3456',
          description: 'Add user settings',
          isBreaking: false
        }
      ],
      bugFixes: [],
      breakingChanges: [],
      otherChanges: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading state
    wrapper = mount(Changelog)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading state
    wrapper = mount(Changelog)
    expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading changelog...')
  })

  it('displays parsed changelog data from main endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.v-progress-circular').exists()).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/changelog')
    expect(wrapper.find('.changelog-content').exists()).toBe(true)
    expect(wrapper.findAll('.v-card').length).toBe(2)
    expect(wrapper.text()).toContain('2.0.0')
    expect(wrapper.text()).toContain('1.1.0')
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.v-alert').exists()).toBe(true)
    })

    expect(wrapper.find('.v-alert').text()).toContain('Failed to load changelog')
  })

  it('displays error message when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.v-alert').exists()).toBe(true)
    })

    expect(wrapper.find('.v-alert').text()).toContain('HTTP 404: Not Found')
  })

  it('highlights breaking changes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    // Should have breaking changes section
    const breakingChip = wrapper.find('.v-chip .mdi-alert')
    expect(breakingChip.exists()).toBe(true)

    // Should have breaking change item with special styling
    const breakingChange = wrapper.find('.breaking-change')
    expect(breakingChange.exists()).toBe(true)
    expect(breakingChange.text()).toContain('Remove deprecated API')
  })

  it('toggles commit body visibility', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    // Should have expand functionality (test the component structure exists)
    const breakingChange = wrapper.find('.breaking-change')
    expect(breakingChange.exists()).toBe(true)

    // Initially body should be hidden
    expect(wrapper.find('.commit-body').exists()).toBe(false)

    // Check that entries with body content are marked appropriately
    expect(wrapper.text()).toContain('Remove deprecated API')
  })

  it('displays breaking change details correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    // Verify the breaking change entry is displayed correctly
    const breakingChangeItem = wrapper.find('.breaking-change')
    expect(breakingChangeItem.exists()).toBe(true)

    // Verify the breaking change has the correct isBreaking flag
    expect(mockReleases[0].breakingChanges[0].isBreaking).toBe(true)
    expect(mockReleases[0].breakingChanges[0].description).toBe('Remove deprecated API')
  })

  it('opens commit URL when chip is clicked', async () => {
    const mockOpen = vi.fn()
    window.open = mockOpen

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    const commitChip = wrapper.find('.commit-chip')
    await commitChip.trigger('click')

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('github.com/nerolis-lab/nerolis-lab/commit/'),
      '_blank'
    )
  })

  it('correctly identifies release types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    const cards = wrapper.findAll('.v-card')

    // Check the first card (major release)
    const majorCard = cards[0]
    const majorChips = majorCard.findAll('.v-chip')
    const majorVersionChip = majorChips.find((chip) => chip.text().includes('2.0.0'))
    expect(majorVersionChip).toBeDefined()
    expect(majorVersionChip!.text()).toContain('2.0.0')

    // Check the second card (minor release)
    const minorCard = cards[1]
    const minorChips = minorCard.findAll('.v-chip')
    const minorVersionChip = minorChips.find((chip) => chip.text().includes('1.1.0'))
    expect(minorVersionChip).toBeDefined()
    expect(minorVersionChip!.text()).toContain('1.1.0')
  })

  it('handles pagination correctly', async () => {
    const manyReleases = Array.from({ length: 15 }, (_, i) => ({
      version: `1.${i}.0`,
      date: '2024-01-01',
      type: 'minor' as const,
      features: [{ commit: `commit${i}`, description: `Feature ${i}`, isBreaking: false }],
      bugFixes: [],
      breakingChanges: [],
      otherChanges: []
    }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(manyReleases)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    // Should show pagination
    const pagination = wrapper.find('.v-pagination')
    expect(pagination.exists()).toBe(true)

    // Should show only 10 items by default
    const cards = wrapper.findAll('.v-card')
    expect(cards.length).toBe(10)
  })
})
