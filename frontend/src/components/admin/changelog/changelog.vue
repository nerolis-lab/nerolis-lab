<template>
  <v-container>
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2">Loading changelog...</p>
    </div>

    <div v-else-if="error" class="text-center">
      <v-alert type="error" class="mb-4"> Failed to load changelog: {{ error }} </v-alert>
    </div>

    <div v-else class="changelog-content">
      <v-card v-for="release in releases" :key="release.version" class="mb-4" elevation="2">
        <v-card-title class="d-flex align-center">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
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
                  class="ml-2" 
                  @click="openCommitUrl(feature.commit)"
                  style="cursor: pointer;"
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
                <v-chip 
                  size="x-small" 
                  variant="outlined" 
                  class="ml-2" 
                  @click="openCommitUrl(fix.commit)"
                  style="cursor: pointer;"
                >
                  {{ fix.commit.substring(0, 7) }}
                </v-chip>
              </li>
            </ul>
          </div>

        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

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

export default defineComponent({
  name: 'Changelog',
  setup() {
    const loading = ref(true)
    const error = ref<string | null>(null)
    const releases = ref<Release[]>([])

    const parseChangelog = (content: string): Release[] => {
      const lines = content.split('\n')
      const parsedReleases: Release[] = []
      let currentRelease: Release | null = null
      let currentSection: 'features' | 'bugfixes' | null = null

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        // Match version headers like ## [2.18.1](...) or # [2.18.0](...)
        const versionMatch = line.match(/^#+\s*\[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/)
        if (versionMatch) {
          if (currentRelease) {
            parsedReleases.push(currentRelease)
          }
          
          const [, version, date] = versionMatch
          const versionParts = version.split('.').map(Number)
          let type: 'major' | 'minor' | 'patch' = 'patch'
          
          // Proper semver classification
          if (versionParts[1] === 0 && versionParts[2] === 0) {
            type = 'major'  // X.0.0
          } else if (versionParts[2] === 0) {
            type = 'minor'  // X.Y.0
          } else {
            type = 'patch'  // X.Y.Z
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

        // Match section headers
        if (line === '### Features') {
          currentSection = 'features'
          continue
        }
        if (line === '### Bug Fixes') {
          currentSection = 'bugfixes'
          continue
        }

        if (currentRelease && currentSection && line.startsWith('*')) {
          console.log(`Processing line in ${currentSection}:`, line)
          
          // Format: * **scope:** description ([commit](url))
          const scopedMatch = line.match(/^\*\s*\*\*([^:]+):\*\*\s*(.+?)\s*\(\[([a-f0-9]{7,40})\]\([^)]+\)\)/)
          if (scopedMatch) {
            const [, scope, description, commit] = scopedMatch
            const entry = { scope: scope.trim(), description: description.trim(), commit }
            console.log('Matched scoped entry:', entry)
            if (currentSection === 'features') {
              currentRelease.features.push(entry)
            } else {
              currentRelease.bugFixes.push(entry)
            }
            continue
          }

          // Format: * description ([commit](url))
          const simpleMatch = line.match(/^\*\s*(.+?)\s*\(\[([a-f0-9]{7,40})\]\([^)]+\)\)/)
          if (simpleMatch) {
            const [, description, commit] = simpleMatch
            const entry = { description: description.trim(), commit }
            console.log('Matched simple entry:', entry)
            if (currentSection === 'features') {
              currentRelease.features.push(entry)
            } else {
              currentRelease.bugFixes.push(entry)
            }
            continue
          }

          // Fallback: Format: * description with any content in parentheses
          const fallbackMatch = line.match(/^\*\s*(.+?)\s*\(.*\)/)
          if (fallbackMatch) {
            const [, description] = fallbackMatch
            const entry = { description: description.trim(), commit: 'unknown' }
            console.log('Matched fallback entry:', entry)
            if (currentSection === 'features') {
              currentRelease.features.push(entry)
            } else {
              currentRelease.bugFixes.push(entry)
            }
          } else {
            console.log('No match for line:', line)
          }
        }
      }

      if (currentRelease) {
        parsedReleases.push(currentRelease)
      }

      // Filter out releases with no content
      const releasesWithContent = parsedReleases.filter(release => 
        release.features.length > 0 || release.bugFixes.length > 0
      )

      console.log(`Parsed ${parsedReleases.length} releases, showing ${releasesWithContent.length} with content`)
      return releasesWithContent
    }

    const loadChangelog = async () => {
      try {
        const response = await fetch('/api/changelog')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const content = await response.text()
        console.log('Raw changelog content (first 500 chars):', content.substring(0, 500))
        console.log('Total content length:', content.length)
        releases.value = parseChangelog(content)
        console.log('Parsed releases:', releases.value.length, releases.value)
        console.log('First release details:', releases.value[0])
        console.log('Second release details:', releases.value[1])
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

    onMounted(() => {
      loadChangelog()
    })

    return {
      loading,
      error,
      releases,
      getReleaseTypeColor,
      getReleaseTypeDescription,
      openCommitUrl
    }
  }
})
</script>

<style scoped>
.changelog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.changelog-content ul {
  list-style-type: disc;
}

.changelog-content li {
  margin-bottom: 4px;
}
</style>
