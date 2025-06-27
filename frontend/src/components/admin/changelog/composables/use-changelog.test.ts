import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChangelog } from './use-changelog'

// Mock fetch globally
global.fetch = vi.fn()

describe('useChangelog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter out empty releases', async () => {
    const mockReleases = [
      {
        version: '2.20.0',
        date: '2025-06-25',
        type: 'minor',
        features: [{ commit: '4bf7584', description: 'Add feature', isBreaking: false }],
        bugFixes: [],
        breakingChanges: [],
        otherChanges: []
      },
      {
        version: '2.19.0',
        date: '2025-06-25',
        type: 'minor',
        features: [],
        bugFixes: [{ commit: 'd080505', description: 'Fix bug', isBreaking: false }],
        breakingChanges: [],
        otherChanges: []
      },
      {
        version: '2.18.1',
        date: '2025-06-24',
        type: 'patch',
        features: [],
        bugFixes: [],
        breakingChanges: [],
        otherChanges: []
      },
      {
        version: '2.17.1',
        date: '2025-06-23',
        type: 'patch',
        features: [],
        bugFixes: [],
        breakingChanges: [],
        otherChanges: []
      },
      {
        version: '2.17.0',
        date: '2025-06-23',
        type: 'minor',
        features: [],
        bugFixes: [],
        breakingChanges: [],
        otherChanges: [{ commit: '530e995', description: 'Other change', isBreaking: false }]
      }
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReleases)
    } as Response)

    const { releases, loadChangelog } = useChangelog()

    await loadChangelog()

    // Should only include releases with actual content (2.20.0, 2.19.0, 2.17.0)
    // Should exclude empty releases (2.18.1, 2.17.1)
    expect(releases.value).toHaveLength(3)
    expect(releases.value.map((r) => r.version)).toEqual(['2.20.0', '2.19.0', '2.17.0'])
    expect(releases.value.map((r) => r.version)).not.toContain('2.18.1')
    expect(releases.value.map((r) => r.version)).not.toContain('2.17.1')
  })

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response)

    const { error, loading, loadChangelog } = useChangelog()

    await loadChangelog()

    expect(error.value).toBe('HTTP 500: Internal Server Error')
    expect(loading.value).toBe(false)
  })

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { error, loading, loadChangelog } = useChangelog()

    await loadChangelog()

    expect(error.value).toBe('Network error')
    expect(loading.value).toBe(false)
  })
})
