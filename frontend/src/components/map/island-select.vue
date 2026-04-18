<template>
  <v-dialog v-model="menu" max-width="560px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <div class="island-activator">
          <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
          <span v-if="isExpertIsland" class="expert-badge" aria-label="expert badge">EX</span>
        </div>
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <v-card-title class="mb-1 pl-0">Select island or berries</v-card-title>

        <section class="island-grid">
          <v-btn
            v-for="i in displayedIslands"
            :key="i.shortName"
            class="island-card"
            :class="{ 'island-card--active': island.shortName === i.shortName }"
            :aria-label="i.shortName"
            :style="{
              '--island-card-image': `url(/images/island/${i.expert && i.base ? i.base.shortName : i.shortName}.png)`
            }"
            color="secondary"
            height="80"
            @click="selectIsland(i)"
          >
            <div class="island-card__content">
              <div class="island-card__title-row">
                <div class="island-card__name">{{ filterIslandName(i.name) }}</div>
                <span v-if="i.expert" class="island-card__expert-chip">EX</span>
              </div>
              <small class="island-card__bonus">{{ areaBonus(i) }}% area bonus</small>
            </div>
          </v-btn>
        </section>

        <v-row dense class="pa-2 flex-between">
          <div>
            <span>Set your area bonus: </span>
            <a class="btn-link" href="/settings">Settings</a>
          </div>
          <v-switch
            v-model="expertToggle"
            aria-label="expert-mode-toggle"
            color="primary"
            density="compact"
            hide-details
            label="Expert Mode"
            @update:model-value="onExpertToggle"
          />
        </v-row>

        <template v-if="!isExpertIsland">
          <v-row dense>
            <v-col cols="12">
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group v-model="island.berries" column multiple selected-class="bg-primary">
                  <v-chip
                    v-for="berry in berries"
                    :key="berry.name"
                    :value="berry"
                    class="ma-1"
                    @click="toggleBerry(berry)"
                  >
                    <v-avatar size="24">
                      <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                    </v-avatar>
                  </v-chip>
                </v-chip-group>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="4" class="flex-left">
              <v-btn color="surface" aria-label="clear button" @click="clear()">Clear</v-btn>
            </v-col>
            <v-col cols="4" class="flex-center">
              <v-btn color="surface" aria-label="select all button" @click="selectAll()">All</v-btn>
            </v-col>
            <v-col cols="4" class="flex-right">
              <v-btn color="secondary" aria-label="save button" @click="saveBerries()">Save</v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-else>
          <v-row dense class="mt-2">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-1">Main favorite berry</div>
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group
                  :model-value="mainFavoriteBerry"
                  column
                  mandatory
                  selected-class="bg-primary"
                  @update:model-value="selectMainFavoriteBerry"
                >
                  <v-chip
                    v-for="b in berries"
                    :key="`main-${b.name}`"
                    :value="b.name"
                    class="ma-1"
                    :aria-label="`main-${b.name.toLowerCase()}`"
                  >
                    <v-avatar size="24">
                      <v-img :src="`/images/berries/${b.name.toLowerCase()}.png`" />
                    </v-avatar>
                  </v-chip>
                </v-chip-group>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-1">Sub favorite berries</div>
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group
                  :model-value="subFavoriteBerries"
                  column
                  multiple
                  selected-class="bg-primary"
                  @update:model-value="selectSubFavoriteBerries"
                >
                  <v-chip
                    v-for="b in berries"
                    :key="`sub-${b.name}`"
                    :value="b.name"
                    :disabled="b.name === mainFavoriteBerry"
                    class="ma-1"
                    :aria-label="`sub-${b.name.toLowerCase()}`"
                  >
                    <v-avatar size="24">
                      <v-img :src="`/images/berries/${b.name.toLowerCase()}.png`" />
                    </v-avatar>
                  </v-chip>
                </v-chip-group>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-1">Weekly random bonus</div>
              <div class="expert-bonus-grid">
                <button
                  v-for="option in RANDOM_BONUS_OPTIONS"
                  :key="option.value"
                  type="button"
                  :aria-label="`random-bonus-${option.value}`"
                  :aria-pressed="randomBonus === option.value"
                  :class="['expert-bonus-tile', { 'expert-bonus-tile--active': randomBonus === option.value }]"
                  @click="selectRandomBonus(option.value)"
                >
                  <v-img :src="option.image" :alt="option.alt" width="32" height="32" class="expert-bonus-tile__icon" />
                  <span class="expert-bonus-tile__label">{{ option.label }}</span>
                  <span class="expert-bonus-tile__hint">{{ option.hint }}</span>
                </button>
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" class="flex-right">
              <v-btn color="secondary" aria-label="save button" @click="saveBerries()">Save</v-btn>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import {
  berry,
  EXPERT_ISLANDS,
  ISLANDS,
  type Berry,
  type ExpertModeSettings,
  type ExpertRandomBonusType,
  type Island,
  type IslandInstance
} from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  previousIsland: IslandInstance
}>()

const emit = defineEmits<{
  'update-island': [island: IslandInstance]
}>()

const userStore = useUserStore()

const menu = ref(false)

const berries = computed<Berry[]>(() => berry.BERRIES.slice().sort((a, b) => a.name.localeCompare(b.name)))

const RANDOM_BONUS_OPTIONS: Array<{
  value: ExpertRandomBonusType
  label: string
  hint: string
  image: string
  alt: string
}> = [
  {
    value: 'ingredient',
    label: 'Ingredient',
    hint: '+1 ingredient, sometimes +2',
    image: '/images/ingredient/ingredients.png',
    alt: 'ingredients icon'
  },
  {
    value: 'berry',
    label: 'Berry',
    hint: '2.4x favorite berry power',
    image: '/images/berries/berries.png',
    alt: 'berries icon'
  },
  {
    value: 'skill',
    label: 'Skill',
    hint: '1.25x main skill chance',
    image: '/images/misc/skillproc.png',
    alt: 'skill proc icon'
  }
]

const defaultExpertMode = (): ExpertModeSettings => ({
  mainFavoriteBerry: berries.value[0],
  subFavoriteBerries: [],
  randomBonus: 'ingredient'
})

const initIsland = (input: IslandInstance): IslandInstance => {
  if (input.expert) {
    return {
      ...input,
      berries: [...input.berries],
      expertMode: input.expertMode ?? defaultExpertMode()
    }
  }
  return { ...input, berries: [...input.berries] }
}

const island = ref<IslandInstance>(initIsland(props.previousIsland))

const selectableIslands = computed<IslandInstance[]>(() => [...userStore.baseIslands, ...userStore.expertIslands])

const isExpertIsland = computed(() => island.value.expert === true)

const expertToggle = ref(isExpertIsland.value)

const displayedIslands = computed<IslandInstance[]>(() =>
  selectableIslands.value.filter((i) => (expertToggle.value ? i.expert : !i.expert))
)

const mainFavoriteBerry = computed(() =>
  island.value.expert ? (island.value.expertMode?.mainFavoriteBerry.name ?? '') : ''
)
const subFavoriteBerries = computed(() =>
  island.value.expert ? (island.value.expertMode?.subFavoriteBerries.map((b) => b.name) ?? []) : []
)
const randomBonus = computed<ExpertRandomBonusType>(() =>
  island.value.expert ? (island.value.expertMode?.randomBonus ?? 'ingredient') : 'ingredient'
)

watch(
  () => props.previousIsland,
  (newIsland) => {
    island.value = initIsland(newIsland)
    expertToggle.value = newIsland.expert === true
  }
)

const areaBonus = (i: IslandInstance): number => Math.round((userStore.islandBonus(i.shortName) - 1) * 100)

const filterIslandName = (name: string): string => name.replace(/\s*\(Expert Mode\)\s*/gi, '').trim()

const ensureExpertMode = (): ExpertModeSettings => {
  if (!island.value.expert) {
    return defaultExpertMode()
  }
  if (!island.value.expertMode) {
    island.value.expertMode = defaultExpertMode()
  }
  return island.value.expertMode
}

const saveBerries = () => {
  if (island.value.expert) {
    const expertMode = ensureExpertMode()
    island.value.berries = [expertMode.mainFavoriteBerry, ...expertMode.subFavoriteBerries]
  }
  menu.value = false
  updateBerries()
}

const toggleBerry = (berryToToggle: Berry) => {
  const index = island.value.berries.findIndex((item) => item.name === berryToToggle.name)

  if (index === -1) {
    island.value.berries = island.value.berries.concat(berryToToggle)
  } else {
    island.value.berries = island.value.berries.filter((b) => b.name !== berryToToggle.name)
  }
}

const clear = () => {
  island.value.berries = []
}

const selectAll = () => {
  island.value.berries = berries.value
}

const findBaseIsland = (shortName: string): IslandInstance | undefined =>
  userStore.baseIslands.find((i) => i.shortName === shortName)

const findExpertPairedToBase = (base: Island): IslandInstance | undefined =>
  userStore.expertIslands.find((i) => i.expert && i.base?.shortName === base.shortName)

const findFirstExpertIsland = (): IslandInstance | undefined => userStore.expertIslands[0]

const selectIsland = (newIsland: IslandInstance) => {
  island.value = initIsland(newIsland)
  expertToggle.value = island.value.expert === true
}

const onExpertToggle = (value: boolean | null) => {
  const wantExpert = value === true
  if (wantExpert && !island.value.expert) {
    // Try to find an expert island whose base matches the currently selected base island
    const baseIsland = ISLANDS.find((i) => i.shortName === island.value.shortName)
    const paired = baseIsland ? findExpertPairedToBase(baseIsland) : undefined
    const next = paired ?? findFirstExpertIsland()
    if (next) {
      selectIsland(next)
    }
    return
  }
  if (!wantExpert && island.value.expert) {
    // Toggle off: switch to the base of the current expert island (if any)
    const currentExpert = EXPERT_ISLANDS.find((i) => i.shortName === island.value.shortName)
    const baseShortName = currentExpert?.base.shortName
    const next = baseShortName ? findBaseIsland(baseShortName) : undefined
    if (next) {
      selectIsland(next)
    }
  }
}

const selectMainFavoriteBerry = (berryName: unknown) => {
  if (typeof berryName !== 'string' || berryName.length === 0) return
  const selected = berries.value.find((b) => b.name === berryName)
  if (!selected) return

  const expertMode = ensureExpertMode()
  expertMode.mainFavoriteBerry = selected
  expertMode.subFavoriteBerries = expertMode.subFavoriteBerries.filter((b) => b.name !== selected.name)
}

const selectSubFavoriteBerries = (berryNames: unknown) => {
  if (!Array.isArray(berryNames)) return
  const expertMode = ensureExpertMode()
  const mainName = expertMode.mainFavoriteBerry.name
  expertMode.subFavoriteBerries = berries.value.filter((b) => berryNames.includes(b.name) && b.name !== mainName)
}

const selectRandomBonus = (value: unknown) => {
  if (value !== 'ingredient' && value !== 'berry' && value !== 'skill') return
  const expertMode = ensureExpertMode()
  expertMode.randomBonus = value
}

const updateBerries = () => {
  emit('update-island', island.value)
}

// Expose methods and data for testing
defineExpose({
  menu,
  island,
  berries,
  selectableIslands,
  displayedIslands,
  isExpertIsland,
  expertToggle,
  mainFavoriteBerry,
  subFavoriteBerries,
  randomBonus,
  RANDOM_BONUS_OPTIONS,
  areaBonus,
  filterIslandName,
  saveBerries,
  toggleBerry,
  clear,
  selectAll,
  selectIsland,
  onExpertToggle,
  selectMainFavoriteBerry,
  selectSubFavoriteBerries,
  selectRandomBonus
})
</script>

<style scoped>
.selected-island {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-primary));
  transform: scale(1.1);
}

.island-activator {
  position: relative;
  display: inline-block;
}

.island-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.island-card {
  justify-content: stretch;
  text-transform: none;
  letter-spacing: 0.03em;
  overflow: hidden;
  position: relative;
}

.island-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 55%;
  background-image: var(--island-card-image);
  background-repeat: no-repeat;
  background-position: right center;
  background-size: cover;
  pointer-events: none;
  z-index: 0;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.4) 40%, #000 90%);
  mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.4) 40%, #000 90%);
}

.island-card :deep(.v-btn__content) {
  width: 100%;
  height: 100%;
  position: relative;
}

.island-card__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.island-card__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.island-card__name {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.15;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  flex: 1 1 auto;
  min-width: 0;
}

.island-card__bonus {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: left;
}

.island-card__expert-chip {
  flex: 0 0 auto;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.island-card--active {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) inset;
}

.expert-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.expert-badge--option {
  bottom: 0;
  right: 0;
}

.expert-bonus-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.expert-bonus-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease,
    box-shadow 0.15s ease;
  text-align: center;
}

.expert-bonus-tile:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.expert-bonus-tile:active {
  transform: scale(0.98);
}

.expert-bonus-tile--active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.expert-bonus-tile__icon {
  flex: 0 0 auto;
  margin-bottom: 2px;
  opacity: 0.9;
}

.expert-bonus-tile__label {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
}

.expert-bonus-tile__hint {
  font-size: 0.75rem;
  line-height: 1.2;
  opacity: 0.85;
  word-break: break-word;
  white-space: normal;
}
</style>
