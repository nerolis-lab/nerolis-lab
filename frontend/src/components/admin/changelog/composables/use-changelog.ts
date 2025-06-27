import type { Release } from 'sleepapi-common'
import { computed, ref } from 'vue'

export function useChangelog() {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const releases = ref<Release[]>([])
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const loadChangelog = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/changelog')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const allReleases: Release[] = await response.json()

      // Filter out empty releases that have no content
      releases.value = allReleases.filter(
        (release) =>
          release.features.length > 0 ||
          release.bugFixes.length > 0 ||
          release.breakingChanges.length > 0 ||
          release.otherChanges.length > 0
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  const totalPages = computed(() => Math.ceil(releases.value.length / itemsPerPage.value))

  const paginatedReleases = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return releases.value.slice(start, end)
  })

  return {
    loading,
    error,
    releases,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedReleases,
    loadChangelog
  }
}
