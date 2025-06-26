<template>
  <div v-if="loading" class="text-center">
    <v-progress-circular indeterminate color="primary" />
    <p class="mt-2">Loading changelog...</p>
  </div>

  <div v-else-if="error" class="text-center">
    <v-alert type="error" class="mb-4"> Failed to load changelog: {{ error }} </v-alert>
  </div>

  <div v-else>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Changelog</h2>
      <div class="d-flex align-center">
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 20, 50]"
          variant="outlined"
          density="compact"
          hide-details
          persistent-hint
        />
      </div>
    </div>

    <div class="changelog-content">
      <v-card v-for="release in paginatedReleases" :key="release.version" class="mb-4" elevation="2">
        <v-card-title class="d-flex align-center">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-chip :color="getReleaseTypeColor(release.type)" class="mr-3" v-bind="props">
                {{ release.version }}
              </v-chip>
            </template>
            <span>{{ getReleaseTypeDescription(release.type) }}</span>
          </v-tooltip>
          <span class="text-subtitle-1">{{ release.date }}</span>
        </v-card-title>

        <v-card-text>
          <div v-if="release.features.length > 0" class="mb-3">
            <v-chip color="green" variant="text" class="mb-2">
              <v-icon start>mdi-star</v-icon>
              Features
            </v-chip>
            <ul class="ml-4">
              <li v-for="feature in release.features" :key="feature.commit" class="mb-1">
                <strong v-if="feature.scope">[{{ feature.scope }}]</strong>
                {{ feature.description }}
                <v-chip
                  size="x-small"
                  variant="outlined"
                  class="ml-2 commit-chip"
                  @click="openCommitUrl(feature.commit)"
                >
                  {{ feature.commit.substring(0, 7) }}
                </v-chip>
              </li>
            </ul>
          </div>

          <div v-if="release.bugFixes.length > 0" class="mb-3">
            <v-chip color="orange" variant="text" class="mb-2">
              <v-icon start>mdi-bug</v-icon>
              Bug Fixes
            </v-chip>
            <ul class="ml-4">
              <li v-for="fix in release.bugFixes" :key="fix.commit" class="mb-1">
                <strong v-if="fix.scope">[{{ fix.scope }}]</strong>
                {{ fix.description }}
                <v-chip size="x-small" variant="outlined" class="ml-2 commit-chip" @click="openCommitUrl(fix.commit)">
                  {{ fix.commit.substring(0, 7) }}
                </v-chip>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="d-flex justify-center mt-4">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" circle />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

export interface ChangelogEntry {
  commit: string
  description: string
  scope?: string
}

export interface Release {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  features: ChangelogEntry[]
  bugFixes: ChangelogEntry[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const releases = ref<Release[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(10)

const parseChangelog = (content: string): Release[] => {
  const lines = content.split('\n')
  const parsedReleases: Release[] = []
  let currentRelease: Release | null = null
  let currentSection: 'features' | 'bugfixes' | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    const versionMatch = line.match(/^#+\s*\[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/)
    if (versionMatch) {
      if (currentRelease) {
        parsedReleases.push(currentRelease)
      }

      const [, version, date] = versionMatch
      const versionParts = version.split('.').map(Number)
      let type: 'major' | 'minor' | 'patch' = 'patch'

      if (versionParts[1] === 0 && versionParts[2] === 0) {
        type = 'major'
      } else if (versionParts[2] === 0) {
        type = 'minor'
      } else {
        type = 'patch'
      }

      currentRelease = {
        version,
        date,
        type,
        features: [],
        bugFixes: []
      }
      currentSection = null
      continue
    }

    if (line === '### Features') {
      currentSection = 'features'
      continue
    }
    if (line === '### Bug Fixes') {
      currentSection = 'bugfixes'
      continue
    }

    if (currentRelease && currentSection && line.startsWith('*')) {
      const scopedMatch = line.match(/^\*\s*\*\*([^:]+):\*\*\s*(.+?)\s*\(\[([a-f0-9]{7,40})\]\([^)]+\)\)/)
      if (scopedMatch) {
        const [, scope, description, commit] = scopedMatch
        const entry = { scope: scope.trim(), description: description.trim(), commit }
        if (currentSection === 'features') {
          currentRelease.features.push(entry)
        } else {
          currentRelease.bugFixes.push(entry)
        }
        continue
      }

      const simpleMatch = line.match(/^\*\s*(.+?)\s*\(\[([a-f0-9]{7,40})\]\([^)]+\)\)/)
      if (simpleMatch) {
        const [, description, commit] = simpleMatch
        const entry = { description: description.trim(), commit }
        if (currentSection === 'features') {
          currentRelease.features.push(entry)
        } else {
          currentRelease.bugFixes.push(entry)
        }
        continue
      }

      const fallbackMatch = line.match(/^\*\s*(.+?)\s*\(.*\)/)
      if (fallbackMatch) {
        const [, description] = fallbackMatch
        const entry = { description: description.trim(), commit: 'unknown' }
        if (currentSection === 'features') {
          currentRelease.features.push(entry)
        } else {
          currentRelease.bugFixes.push(entry)
        }
      }
    }
  }

  if (currentRelease) {
    parsedReleases.push(currentRelease)
  }

  return parsedReleases.filter((release) => release.features.length > 0 || release.bugFixes.length > 0)
}

const loadChangelog = async () => {
  try {
    const response = await fetch('/api/changelog')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const content = await response.text()
    releases.value = parseChangelog(content)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const getReleaseTypeColor = (type: string) => {
  switch (type) {
    case 'major':
      return 'red'
    case 'minor':
      return 'orange'
    case 'patch':
      return 'green'
    default:
      return 'grey'
  }
}

const openCommitUrl = (commit: string) => {
  if (commit && commit !== 'unknown') {
    const url = `https://github.com/nerolis-lab/nerolis-lab/commit/${commit}`
    window.open(url, '_blank')
  }
}

const getReleaseTypeDescription = (type: string) => {
  switch (type) {
    case 'major':
      return 'Major Release - Breaking changes or significant new features'
    case 'minor':
      return 'Minor Release - New features without breaking changes'
    case 'patch':
      return 'Patch Release - Bug fixes and small improvements'
    default:
      return 'Unknown release type'
  }
}

const totalPages = computed(() => Math.ceil(releases.value.length / itemsPerPage.value))

const paginatedReleases = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return releases.value.slice(start, end)
})

onMounted(() => {
  loadChangelog()
})
</script>

<style scoped>
.changelog-content ul {
  list-style-type: disc;
}

.changelog-content li {
  margin-bottom: 4px;
}

.commit-chip {
  cursor: pointer;
}

.commit-chip:hover {
  opacity: 0.8;
}
</style>
