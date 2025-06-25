import Changelog from '@/components/admin/changelog/changelog.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Changelog.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof Changelog>>

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

  it('displays changelog content after successful fetch', async () => {
    const mockChangelogContent = `# Changelog

## [2.19.0](https://github.com/nerolis-lab/nerolis-lab/compare/v2.18.1...v2.19.0) (2023-12-15)

### Features

* **api:** add changelog endpoint ([abc1234](https://github.com/nerolis-lab/nerolis-lab/commit/abc1234))
* **frontend:** add changelog admin interface ([def5678](https://github.com/nerolis-lab/nerolis-lab/commit/def5678))

### Bug Fixes

* **backend:** fix changelog file path resolution ([hij9012](https://github.com/nerolis-lab/nerolis-lab/commit/hij9012))`

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockChangelogContent)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.v-progress-circular').exists()).toBe(false)
    })

    expect(wrapper.find('.changelog-content').exists()).toBe(true)
    expect(wrapper.find('.v-chip').text()).toContain('2.19.0')
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

  it('correctly parses and displays release types', async () => {
    const mockChangelogContent = `# Changelog

## [1.0.0](https://github.com/nerolis-lab/nerolis-lab/compare/v0.9.0...v1.0.0) (2023-01-01)

### Features

* **breaking:** major release feature ([abc1234](https://github.com/nerolis-lab/nerolis-lab/commit/abc1234))

## [0.9.0](https://github.com/nerolis-lab/nerolis-lab/compare/v0.8.1...v0.9.0) (2023-01-01)

### Features

* **minor:** minor release feature ([def5678](https://github.com/nerolis-lab/nerolis-lab/commit/def5678))

## [0.8.1](https://github.com/nerolis-lab/nerolis-lab/compare/v0.8.0...v0.8.1) (2023-01-01)

### Bug Fixes

* **patch:** patch release fix ([hij9012](https://github.com/nerolis-lab/nerolis-lab/commit/hij9012))`

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(mockChangelogContent)
    })

    wrapper = mount(Changelog)
    await vi.waitFor(() => {
      expect(wrapper.find('.changelog-content').exists()).toBe(true)
    })

    const chips = wrapper.findAll('.v-chip')
    expect(chips.length).toBeGreaterThan(0)
    expect(chips[0].text()).toContain('1.0.0')
  })
})
