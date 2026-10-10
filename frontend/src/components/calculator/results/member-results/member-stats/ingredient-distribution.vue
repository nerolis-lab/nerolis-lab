<template>
  <div class="flex-left">
    <v-dialog v-model="show" :close-on-content-click="false" max-width="1000">
      <template #activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" append-icon="mdi-chart-bell-curve">Ingredient distribution</v-btn>
      </template>
      <v-card class="pa-2 pa-sm-4">
        <h2 class="text-h6">{{ pokemonProduction.member.name }}’s daily ingredients</h2>
        <p class="text-body-2 mt-1 mb-3">Includes production, skills, and teammate help.</p>
        <v-btn-toggle
          v-model="mode"
          mandatory
          divided
          density="compact"
          class="mb-3 flex-shrink-0"
          aria-label="Distribution statistics"
        >
          <v-btn value="Average">Average</v-btn>
          <v-btn value="Median">Median</v-btn>
        </v-btn-toggle>
        <div v-if="distributions.length" class="distribution-layout" :style="{ '--chart-height': `${bottom + 55}px` }">
          <div class="ingredient-selector">
            <div class="ingredient-options" aria-label="Displayed ingredients">
              <v-checkbox
                v-for="distribution in distributions"
                :key="distribution.name"
                v-model="selected"
                :value="distribution.name"
                :color="ingredientColor(distribution.name)"
                hide-details
                density="compact"
              >
                <template #label>
                  <img :src="ingredientImage(distribution.name)" alt="" width="24" height="24" class="mr-1" />
                  {{ distribution.name }}
                </template>
              </v-checkbox>
            </div>
          </div>
          <div ref="graphContainer" class="graph-container">
            <div class="graph-scroll" @scroll="layoutVersion++">
              <svg
                ref="chartElement"
                :viewBox="`0 0 ${chartWidth} ${bottom + 55}`"
                role="group"
                aria-label="Daily ingredient output distributions"
              >
                <g v-for="tick in 5" :key="tick">
                  <line
                    :x1="left"
                    :x2="right"
                    :y1="top + ((tick - 1) * plotHeight) / 4"
                    :y2="top + ((tick - 1) * plotHeight) / 4"
                    stroke="currentColor"
                    opacity="0.12"
                  />
                  <text
                    :x="left - 8"
                    :y="top + ((tick - 1) * plotHeight) / 4"
                    text-anchor="end"
                    dominant-baseline="middle"
                    fill="currentColor"
                    font-size="12"
                  >
                    {{ Number(((maxDensity * (5 - tick) * 100) / 4).toPrecision(2)) }}%
                  </text>
                </g>
                <line :x1="left" :x2="right" :y1="bottom" :y2="bottom" stroke="currentColor" />
                <g v-for="tick in ticks" :key="`x-${tick}`">
                  <line
                    :x1="xPosition(tick)"
                    :x2="xPosition(tick)"
                    :y1="bottom"
                    :y2="bottom + 5"
                    stroke="currentColor"
                  />
                  <text :x="xPosition(tick)" :y="bottom + 20" text-anchor="middle" fill="currentColor" font-size="12">
                    {{ tick }}
                  </text>
                </g>
                <text :x="chartWidth / 2" :y="bottom + 45" text-anchor="middle" fill="currentColor" font-size="12">
                  Ingredients per day
                </text>
                <path
                  v-for="curve in curves"
                  :key="curve.distribution.name"
                  :d="curve.path"
                  :fill="`${ingredientColor(curve.distribution.name)}33`"
                  :stroke="ingredientColor(curve.distribution.name)"
                  stroke-width="1"
                  tabindex="0"
                  role="button"
                  :aria-label="tooltipLines(curve.distribution).join(', ')"
                  @click="hovered = curve.distribution.name"
                  @keydown.enter="hovered = curve.distribution.name"
                  @keydown.space.prevent="hovered = curve.distribution.name"
                  @keydown.esc="hovered = undefined"
                  @mouseenter="hovered = curve.distribution.name"
                  @mouseleave="hovered = undefined"
                  @focus="hovered = curve.distribution.name"
                  @blur="hovered = undefined"
                />
                <g v-for="curve in curves" :key="`marker-${curve.distribution.name}`" pointer-events="none">
                  <line
                    :x1="xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median'])"
                    :x2="xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median'])"
                    :y1="top"
                    :y2="bottom"
                    :stroke="ingredientColor(curve.distribution.name)"
                    stroke-width="2"
                    stroke-dasharray="5 5"
                  />
                  <image
                    :href="ingredientImage(curve.distribution.name)"
                    :x="xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median']) - 10"
                    :y="top - 26"
                    width="20"
                    height="20"
                  />
                </g>
              </svg>
            </div>
            <div
              v-if="tooltipDistribution"
              class="distribution-tooltip"
              :class="{ visible: hoveredDistribution }"
              :aria-hidden="!hoveredDistribution"
              role="tooltip"
              :style="tooltipPosition"
            >
              <div v-for="line in tooltipLines(tooltipDistribution!)" :key="line">{{ line }}</div>
            </div>
            <p v-if="!selected.length" class="text-body-2">Select an ingredient to display its distribution.</p>
          </div>
        </div>
        <p v-else class="my-4">No ingredient distribution data. Calculate this team to see its distributions.</p>
        <div v-if="otherAverage !== undefined" class="d-flex align-center mt-3 text-body-2">
          <img :src="ingredientImage('magnet')" width="28" height="28" alt="Other ingredients" class="mr-2" />
          Other ingredients: {{ format(otherAverage) }} per day on average
        </div>
        <v-btn color="secondary" class="mt-3 align-self-sm-start" @click="show = false">Close</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MemberWithProduction } from '@/types/member/instanced'
import { ingredientImage } from '@/services/utils/image-utils'
import {
  ingredientColor,
  ingredientCurve,
  ingredientUpperBound,
  summarizeIngredient,
  type IngredientDistribution
} from '../ingredient-breakdown/ingredient-distribution-data'

const props = defineProps<{ pokemonProduction: MemberWithProduction }>()
const show = ref(false)
const mode = ref<'Average' | 'Median'>('Average')
const selected = ref<string[]>([])
const hovered = ref<string>()
const lastHovered = ref<string>()
const chartElement = ref<SVGSVGElement>()
const graphContainer = ref<HTMLDivElement>()
const layoutVersion = ref(0)
const chartWidth = ref(660)
let resizeObserver: ResizeObserver | undefined
watch(
  graphContainer,
  (element) => {
    resizeObserver?.disconnect()
    if (element) {
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width > 0) chartWidth.value = entry.contentRect.width
        layoutVersion.value++
      })
      resizeObserver.observe(element)
    }
  },
  { flush: 'post' }
)
onBeforeUnmount(() => resizeObserver?.disconnect())
const distributions = computed(() =>
  Object.entries(props.pokemonProduction.production.advanced?.ingredientDistributions ?? {}).map(
    ([name, distribution]) => summarizeIngredient(name, distribution)
  )
)
function resetIngredientSelection() {
  selected.value = [...distributions.value]
    .sort((a, b) => b.average - a.average || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map(({ name }) => name)
  hovered.value = undefined
  lastHovered.value = undefined
}
watch(distributions, resetIngredientSelection, { immediate: true })
const otherAverage = computed(() => props.pokemonProduction.production.advanced?.nonSignificantIngredientAverage)
const upperBound = computed(() => ingredientUpperBound(distributions.value))
const ticks = computed(() => {
  const intervals = Math.max(1, Math.floor(plotWidth.value / 45))
  const step = Math.max(10, Math.ceil(upperBound.value / intervals / 10) * 10)
  return Array.from({ length: Math.floor(upperBound.value / step) + 1 }, (_, index) => index * step)
})
const left = 48
const right = computed(() => chartWidth.value - 20)
const plotWidth = computed(() => right.value - left)
const top = 40
const plotHeight = computed(() => Math.min(280, Math.max(180, chartWidth.value * 0.55)))
const bottom = computed(() => top + plotHeight.value)
const xPosition = (value: number) => left + (value / upperBound.value) * plotWidth.value
const sampled = computed(() =>
  distributions.value.map((distribution) => ({ distribution, points: ingredientCurve(distribution, upperBound.value) }))
)
const maxDensity = computed(() => {
  const peak = Math.max(0.01, ...sampled.value.flatMap(({ points }) => points.map(({ y }) => y)))
  const step = 10 ** Math.floor(Math.log10(peak))
  return Math.ceil(peak / step) * step
})
const curves = computed(() =>
  sampled.value
    .filter(({ distribution }) => selected.value.includes(distribution.name))
    .map(({ distribution, points }) => ({
      distribution,
      points,
      path:
        `M ${left} ${bottom.value} ` +
        points
          .map(({ x, y }) => `L ${xPosition(x)} ${bottom.value - (y / maxDensity.value) * plotHeight.value}`)
          .join(' ') +
        ` L ${right.value} ${bottom.value} Z`
    }))
)
const hoveredCurve = computed(() => curves.value.find(({ distribution }) => distribution.name === hovered.value))
const hoveredDistribution = computed(() => hoveredCurve.value?.distribution)
// Keep one tooltip mounted so its position can animate when the hovered curve changes.
watch(hoveredCurve, (curve) => {
  if (curve) lastHovered.value = curve.distribution.name
})
watch(show, (visible) => {
  if (visible) resetIngredientSelection()
  else hovered.value = undefined
})
const tooltipCurve = computed(() => sampled.value.find(({ distribution }) => distribution.name === lastHovered.value))
const tooltipDistribution = computed(() => tooltipCurve.value?.distribution)
const tooltipPosition = computed(() => {
  // Resize and horizontal scrolling change the SVG-to-dialog coordinate mapping.
  void layoutVersion.value
  const curve = tooltipCurve.value
  if (!curve) return {}
  const centralValue = curve.distribution[mode.value === 'Average' ? 'average' : 'median']
  const pointIndex = (centralValue / upperBound.value) * (curve.points.length - 1)
  const before = curve.points[Math.floor(pointIndex)]
  const after = curve.points[Math.min(Math.ceil(pointIndex), curve.points.length - 1)]
  const density = before.y + (after.y - before.y) * (pointIndex % 1)
  const svgBounds = chartElement.value?.getBoundingClientRect()
  const containerBounds = graphContainer.value?.getBoundingClientRect()
  const scale = (svgBounds?.width || chartWidth.value) / chartWidth.value
  return {
    left: `${(svgBounds?.left ?? 0) - (containerBounds?.left ?? 0) + xPosition(centralValue) * scale + 12}px`,
    top: `${(bottom.value - (density / maxDensity.value) * plotHeight.value) * scale}px`
  }
})
const format = (value: number) => Number(value.toFixed(1)).toLocaleString()
function tooltipLines(distribution: IngredientDistribution) {
  if (mode.value === 'Median')
    return [
      distribution.name,
      `1st quartile: ${format(distribution.firstQuartile)}`,
      `Median: ${format(distribution.median)}`,
      `3rd quartile: ${format(distribution.thirdQuartile)}`
    ]
  return [
    distribution.name,
    ...[-2, -1, 0, 1, 2].map(
      (deviation) =>
        `${deviation === 0 ? 'Average' : `${deviation > 0 ? '+' : ''}${deviation} stddev`}: ${format(distribution.average + deviation * distribution.standardDeviation)}`
    )
  ]
}
</script>

<style scoped>
.distribution-layout {
  display: flex;
  gap: 16px;
}
.ingredient-selector {
  flex: 0 0 180px;
  min-width: 0;
}
.ingredient-options {
  max-height: var(--chart-height);
  overflow-y: auto;
}
.ingredient-options :deep(.v-label) {
  white-space: nowrap;
}
.graph-container {
  position: relative;
  flex: 1;
  min-width: 0;
}
.graph-scroll {
  overflow-x: auto;
}
.graph-container svg {
  width: 100%;
  display: block;
}
.distribution-tooltip {
  position: absolute;
  transform: translateY(-50%);
  white-space: nowrap;
  z-index: 1;
  pointer-events: none;
  background: rgb(0 0 0 / 80%);
  color: white;
  border-radius: 6px;
  padding: 6px;
  font:
    12px 'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif;
  opacity: 0;
  transition:
    left 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
    top 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
    opacity 200ms linear;
}
.distribution-tooltip.visible {
  opacity: 1;
}
.distribution-tooltip::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid rgb(0 0 0 / 80%);
}
.distribution-tooltip > :first-child {
  font-weight: bold;
  margin-bottom: 6px;
}
@media (prefers-reduced-motion: reduce) {
  .distribution-tooltip {
    transition: none;
  }
}
@media (max-width: 600px) {
  .distribution-layout {
    flex-direction: column;
    gap: 8px;
  }
  .ingredient-selector {
    flex: 0 0 auto;
  }
  .ingredient-options {
    display: flex;
    flex-direction: column;
    /* Reveal half of the fourth row to indicate more ingredients below. */
    max-height: 140px;
  }
  .ingredient-options :deep(.v-checkbox) {
    flex: 0 0 40px;
  }
  .distribution-tooltip {
    position: static;
    transform: none;
    display: none;
    margin-top: 8px;
    white-space: normal;
    transition: none;
  }
  .distribution-tooltip.visible {
    display: block;
  }
  .distribution-tooltip::before {
    display: none;
  }
}
</style>
