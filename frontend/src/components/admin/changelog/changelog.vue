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
          <div v-if="release.breakingChanges.length > 0" class="mb-4">
            <v-chip color="red" variant="flat" class="mb-2">
              <v-icon start>mdi-alert</v-icon>
              BREAKING CHANGES
            </v-chip>
            <ul class="ml-4">
              <li v-for="change in release.breakingChanges" :key="change.commit" class="mb-2 breaking-change">
                <div class="d-flex align-center">
                  <strong v-if="change.scope" class="text-red">[{{ change.scope }}]</strong>
                  <span :class="{ 'text-red': !change.scope }">{{ change.description }}</span>
                  <v-chip
                    size="x-small"
                    variant="outlined"
                    class="ml-2 commit-chip"
                    @click="openCommitUrl(change.commit)"
                  >
                    {{ change.commit.substring(0, 7) }}
                  </v-chip>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="release.features.length > 0" class="mb-3">
            <v-chip color="green" variant="text" class="mb-2">
              <v-icon start>mdi-star</v-icon>
              Features
            </v-chip>
            <ul class="ml-4">
              <li v-for="feature in release.features" :key="feature.commit" class="mb-1">
                <div class="d-flex align-center">
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
                </div>
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
                <div class="d-flex align-center">
                  <strong v-if="fix.scope">[{{ fix.scope }}]</strong>
                  {{ fix.description }}
                  <v-chip size="x-small" variant="outlined" class="ml-2 commit-chip" @click="openCommitUrl(fix.commit)">
                    {{ fix.commit.substring(0, 7) }}
                  </v-chip>
                </div>
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
import { onMounted } from 'vue'
import { useChangelog } from './composables/use-changelog'

const { loading, error, currentPage, itemsPerPage, totalPages, paginatedReleases, loadChangelog } = useChangelog()

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

.breaking-change {
  border-left: 3px solid #f44336;
  padding-left: 12px;
}

.text-red {
  color: #f44336 !important;
}
</style>
