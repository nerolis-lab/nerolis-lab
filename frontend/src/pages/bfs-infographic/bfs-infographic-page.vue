<template>
  <v-container class="bfs-infographic-page">
    <h1 class="text-h4 mb-4">Raptor Berry Finding S Index</h1>
    <div class="d-flex align-center ga-2 mb-4">
      <img src="/images/authors/velocityraptor22.png" alt="" width="40" height="40" class="rounded-circle" />
      <img src="/images/authors/cowtools.png" alt="" width="40" height="40" class="rounded-circle" />
      <span>by VelocityRaptor22 and CowTools</span>
    </div>
    <p class="mb-4">
      How much each Pokémon benefits from Berry Finding S, based on
      <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">u/VelocityRaptor22's original BFS index</a>.
    </p>
    <div class="d-flex flex-wrap ga-4 mb-4">
      <v-switch
        v-model="includeUnevolved"
        label="Include unevolved Pokémon"
        color="primary"
        hide-details
        data-testid="include-unevolved"
      />
      <v-switch
        v-model="ingredientFinderM"
        label="Ingredient Finder M for ingredient specialists"
        color="primary"
        hide-details
        data-testid="ingredient-finder-m"
      />
    </div>

    <v-text-field
      v-model="searchQuery"
      label="Search Pokémon"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-4"
      data-testid="pokemon-search"
    />

    <h2 id="bfs-chart-title" class="chart-title text-h5 pa-4">Raptor BFS Value Index</h2>
    <div class="chart-container" role="region" aria-labelledby="bfs-chart-title">
      <table ref="chartTable" class="index-chart" aria-labelledby="bfs-chart-title">
        <colgroup>
          <col class="range-column" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Index range</th>
            <th scope="col">Pokémon · highest to lowest</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.min">
            <th scope="row" class="range-label" :style="{ backgroundColor: rangeColor(row.min) }">
              {{ row.min.toFixed(1) }} - &lt;{{ row.max.toFixed(1) }}
            </th>
            <td>
              <ol class="pokemon-list">
                <li v-for="(entry, index) in row.entries" :key="entry.pokemon.name" class="pokemon-entry">
                  <img
                    :src="avatarImage({ pokemonName: entry.pokemon.name, shiny: false, happy: false })"
                    :alt="entry.pokemon.displayName"
                    :title="`${entry.pokemon.displayName} · ${entry.pokemon.specialty} · ${formatBfsIndex(entry.score)}`"
                    width="72"
                    height="72"
                    loading="lazy"
                  />
                  <v-card
                    class="pokemon-score text-center rounded-0"
                    :color="index % 2 === 0 ? 'white' : 'grey-lighten-2'"
                    variant="flat"
                    :aria-label="`${entry.pokemon.displayName}: ${formatBfsIndex(entry.score)}`"
                  >
                    {{ formatBfsIndex(entry.score) }}
                  </v-card>
                </li>
              </ol>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td colspan="2"><span class="empty-row text-center" role="status">No matching Pokémon</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="calculation-explanation mt-6" aria-labelledby="calculation-title">
      <h2 id="calculation-title" class="text-h5 mb-4">How the index is calculated</h2>
      <p>Skill and “All” specialists: <code>(864 / f) × (1 − i) × b</code></p>
      <p>
        Ingredient specialists:
        <code>{{ ingredientFinderM ? '(864 / f) × (1 − 1.36 × i) × b' : '(864 / f) × (1 − i) × b' }}</code>
      </p>
      <p>
        Ingredient specialists are assumed to have the Ingredient Finding M subskill by default, which causes them to
        find ingredients rather than berries 36% more often.
      </p>
      <p>
        <code>864</code> is the number of seconds in a day (86,400) divided by 100 to keep index scores compact.<br />
        <code>f</code> is base helping frequency in seconds.<br />
        <code>i</code> is base ingredient rate as a fraction.<br />
        <code>b</code> is base berry strength.
      </p>
      <p>
        Formula and chart concept by
        <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">u/VelocityRaptor22</a>.
      </p>
      <v-btn
        color="primary"
        prepend-icon="mdi-download"
        :loading="exporting"
        :disabled="filteredRows.length === 0"
        data-testid="export-chart"
        @click="exportPng"
        >Save chart as PNG</v-btn
      >
      <p v-if="exportError" role="alert">{{ exportError }}</p>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { buildBfsIndexRows, formatBfsIndex, rangeColor } from '@/services/bfs-index-service'
import { avatarImage } from '@/services/utils/image-utils'
import { computed, ref } from 'vue'
import { bfsExportFilename, createBfsIndexPng } from '@/services/bfs-index-export'

const sourceUrl =
  'https://www.reddit.com/r/PokemonSleep/comments/1m9nnh3/bfs_value_on_nonberry_mons_numerically_indexed/'

const chartTable = ref<HTMLTableElement | null>(null)
const includeUnevolved = ref(false)
const ingredientFinderM = ref(true)
const searchQuery = ref<string | null>('')
const rows = computed(() =>
  buildBfsIndexRows(undefined, {
    includeUnevolved: includeUnevolved.value,
    ingredientFinderM: ingredientFinderM.value
  })
)
const filteredRows = computed(() => {
  const query = normalizeSearch(searchQuery.value ?? '').trim()
  if (!query) return rows.value

  return rows.value
    .map((row) => ({
      ...row,
      entries: row.entries.filter((entry) => normalizeSearch(entry.pokemon.displayName).includes(query))
    }))
    .filter((row) => row.entries.length > 0)
})

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .toLowerCase()
}

const exporting = ref(false)
const exportError = ref('')

async function exportPng() {
  if (exporting.value || filteredRows.value.length === 0) return
  exporting.value = true
  exportError.value = ''
  const snapshot = {
    rows: filteredRows.value,
    includeUnevolved: includeUnevolved.value,
    ingredientFinderM: ingredientFinderM.value,
    search: searchQuery.value ?? '',
    headerBackground: getComputedStyle(chartTable.value!.tHead!.rows[0].cells[0]).backgroundColor
  }
  try {
    const blob = await createBfsIndexPng(snapshot)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = bfsExportFilename(snapshot)
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Give the browser time to start the download before releasing its URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    exportError.value = 'Could not export the chart. Please try again.'
  } finally {
    exporting.value = false
  }
}

defineExpose({ exportPng, exporting, exportError, canExport: computed(() => filteredRows.value.length > 0) })
</script>

<style scoped lang="scss">
.bfs-infographic-page {
  width: 100%;
  max-width: 1280px;
  min-width: 0;
}

.chart-container {
  width: 100%;
  border-radius: 0 0 8px 8px;
}

.chart-title {
  background: #171717;
  color: #fff;
  text-align: center;
  border-radius: 8px 8px 0 0;
}

.index-chart {
  display: table;
  margin: 0;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background: #444;
  color: #fff;

  thead {
    background: #171717;
    color: #fff;
  }

  thead th {
    background: #171717;
    padding: 8px;
    font-size: 0.8rem;
    text-align: left;
  }

  thead th:first-child {
    text-align: center;
  }

  tbody tr:nth-child(even) {
    background: #606060;
  }

  td {
    padding: 0;
  }

  th,
  td {
    border-bottom: 1px solid #222;
  }
}

.range-column {
  width: 112px;
}

.range-label {
  padding: 10px;
  font-size: 0.85rem;
  text-align: center;
  white-space: nowrap;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  min-height: 88px;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0;
}

.pokemon-list > .pokemon-entry {
  flex: 0 0 min(72px, 100%);
  margin: 0;

  img {
    display: block;
    width: 100%;
    height: 72px;
    margin: 0;
    object-fit: cover;
  }
}

.pokemon-score {
  width: 100%;
  height: 16px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 16px;
  color: #111;
  font-variant-numeric: tabular-nums;
}

.empty-row {
  display: block;
  padding: 20px;
  font-size: 0.85rem;
}
.calculation-explanation p {
  margin-bottom: 16px;
}

.calculation-explanation code {
  overflow-wrap: anywhere;
}
</style>
