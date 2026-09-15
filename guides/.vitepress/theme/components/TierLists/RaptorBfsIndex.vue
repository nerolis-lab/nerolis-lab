<template>
  <div class="bfs-index-page vp-raw">
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
      <table class="index-chart" aria-labelledby="bfs-chart-title">
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
                    :src="bfsPokemonPortrait(entry.pokemon.name)"
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
  </div>
</template>

<script setup lang="ts">
import { buildBfsIndexRows, formatBfsIndex } from '../../../lib/bfs-index-service';
import { bfsPokemonPortrait } from '../../utils/bfs-index-portraits';
import { computed, ref } from 'vue';

const includeUnevolved = ref(false);
const ingredientFinderM = defineModel<boolean>('ingredientFinderM', { default: true });
const searchQuery = ref<string | null>('');
const rows = computed(() =>
  buildBfsIndexRows(undefined, {
    includeUnevolved: includeUnevolved.value,
    ingredientFinderM: ingredientFinderM.value
  })
);
const filteredRows = computed(() => {
  const query = normalizeSearch(searchQuery.value ?? '').trim();
  if (!query) return rows.value;

  return rows.value
    .map((row) => ({
      ...row,
      entries: row.entries.filter((entry) => normalizeSearch(entry.pokemon.displayName).includes(query))
    }))
    .filter((row) => row.entries.length > 0);
});

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .toLowerCase();
}

function rangeColor(min: number): string {
  // Purple at the top, through green, to red at the bottom, matching the reference chart.
  const hue = Math.max(0, Math.min(260, ((min - 4.5) / 5.5) * 260));
  return `hsl(${hue} 45% 28%)`;
}
</script>

<style scoped lang="scss">
.bfs-index-page {
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
  // Override VitePress's prose spacing on consecutive list items.
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
</style>
