<template>
  <v-row class="px-2">
    <v-col class="flex-left">
      <v-dialog v-model="show" :close-on-content-click="false" max-width="1000">
        <template #activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" append-icon="mdi-chart-bell-curve">Ingredient distribution</v-btn>
        </template>
        <v-card class="pa-4">
          <h2 class="text-h6">{{ pokemonProduction.member.name }}’s daily ingredients</h2>
          <p class="text-body-2 mt-1 mb-3">
            Ingredient output includes production and skills, including help received from teammates.
          </p>
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
          <div v-if="distributions.length" class="distribution-layout">
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
            <div ref="graphContainer" class="graph-container">
              <div class="graph-scroll" @scroll="layoutVersion++">
                <svg
                  ref="chartElement"
                  :viewBox="`0 0 ${chartWidth} ${bottom + 55}`"
                  :style="{ minWidth: `${minimumChartWidth}px` }"
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
                  <text
                    x="18"
                    :y="top + 140"
                    :transform="`rotate(-90 18 ${top + 140})`"
                    text-anchor="middle"
                    fill="currentColor"
                    font-size="12"
                  >
                    Probability density
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
                  <g v-for="(curve, index) in curves" :key="`marker-${curve.distribution.name}`" pointer-events="none">
                    <line
                      :x1="xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median'])"
                      :x2="xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median'])"
                      :y1="top"
                      :y2="bottom"
                      :stroke="ingredientColor(curve.distribution.name)"
                      stroke-width="2"
                      stroke-dasharray="5 5"
                    />
                    <g
                      :transform="`translate(${Math.min(right - 40, Math.max(90, xPosition(curve.distribution[mode === 'Average' ? 'average' : 'median'])))}, ${18 + index * 20})`"
                    >
                      <text
                        x="-6"
                        y="0"
                        text-anchor="end"
                        :fill="ingredientColor(curve.distribution.name)"
                        font-size="12"
                      >
                        {{ mode }}
                      </text>
                      <image :href="ingredientImage(curve.distribution.name)" x="0" y="-15" width="20" height="20" />
                    </g>
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
          <p class="text-caption mt-3">
            Curves smooth the simulated daily results. Statistics use those results directly.
          </p>
          <v-btn color="secondary" class="mt-3 align-self-start" @click="show = false">Close</v-btn>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
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
let resizeObserver: ResizeObserver | undefined
watch(
  chartElement,
  (element) => {
    resizeObserver?.disconnect()
    if (element) {
      resizeObserver = new ResizeObserver(() => {
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
const ticks = computed(() => Array.from({ length: upperBound.value / 10 + 1 }, (_, index) => index * 10))
const minimumChartWidth = computed(() => Math.max(390, ticks.value.length * 28 + 68))
const chartWidth = computed(() => Math.max(660, minimumChartWidth.value))
const left = 48
const right = computed(() => chartWidth.value - 20)
const plotWidth = computed(() => right.value - left)
const top = computed(() => Math.max(40, selected.value.length * 20 + 12))
const plotHeight = 280
const bottom = computed(() => top.value + plotHeight)
const xPosition = (value: number) => left + (value / upperBound.value) * plotWidth.value
const sampled = computed(() =>
  distributions.value.map((distribution) => ({ distribution, points: ingredientCurve(distribution, upperBound.value) }))
)
const maxDensity = computed(() => Math.max(0.01, ...sampled.value.flatMap(({ points }) => points.map(({ y }) => y))))
const curves = computed(() =>
  sampled.value
    .filter(({ distribution }) => selected.value.includes(distribution.name))
    .map(({ distribution, points }) => ({
      distribution,
      points,
      path:
        `M ${left} ${bottom.value} ` +
        points.map(({ x, y }) => `L ${xPosition(x)} ${bottom.value - (y / maxDensity.value) * plotHeight}`).join(' ') +
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
    top: `${(bottom.value - (density / maxDensity.value) * plotHeight) * scale}px`
  }
})
const format = (value: number) => Number(value.toFixed(1)).toLocaleString()
function tooltipLines(distribution: IngredientDistribution) {
  if (mode.value === 'Median')
    return [
      distribution.name,
      `Median: ${format(distribution.median)}`,
      `1st quartile: ${format(distribution.firstQuartile)}`,
      `3rd quartile: ${format(distribution.thirdQuartile)}`
    ]
  return [
    distribution.name,
    `Average: ${format(distribution.average)}`,
    ...[-2, -1, 1, 2].map(
      (deviation) =>
        `${deviation > 0 ? '+' : ''}${deviation} stddev: ${format(distribution.average + deviation * distribution.standardDeviation)}`
    )
  ]
}
</script>

<style scoped>
.distribution-layout {
  display: flex;
  gap: 16px;
}
.ingredient-options {
  flex: 0 0 140px;
  max-height: 450px;
  overflow-y: auto;
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
    gap: 4px;
  }
  .ingredient-options {
    flex-basis: 110px;
  }

  .graph-container svg {
    min-width: 390px;
  }
}
</style>
