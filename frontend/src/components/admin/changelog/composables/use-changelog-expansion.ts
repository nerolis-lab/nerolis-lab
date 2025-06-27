import type { Release } from 'sleepapi-common'
import { ref } from 'vue'

export function useChangelogExpansion() {
  const expandedEntries = ref<Record<string, boolean>>({})

  const toggleExpanded = (entryId: string) => {
    expandedEntries.value[entryId] = !expandedEntries.value[entryId]
  }

  const getEntryId = (release: Release, type: string, index: number) => {
    return `${release.version}-${type}-${index}`
  }

  const isExpanded = (entryId: string) => {
    return expandedEntries.value[entryId] ?? false
  }

  return {
    expandedEntries,
    toggleExpanded,
    getEntryId,
    isExpanded
  }
}
