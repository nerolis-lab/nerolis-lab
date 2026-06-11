<template>
  <v-dialog v-model="menu" max-width="560px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <div class="island-activator">
          <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
          <span v-if="isExpertIsland" class="expert-chip expert-badge text-small" aria-label="expert badge">EX</span>
        </div>
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <div class="dialog-header flex-between flex-wrap">
          <v-card-title class="dialog-title pl-0">Island Settings</v-card-title>
          <v-switch
            v-model="expertToggle"
            aria-label="expert-mode-toggle"
            class="expert-mode-toggle"
            color="primary"
            density="compact"
            hide-details
            label="Expert Mode"
            @update:model-value="onExpertToggle"
          />
        </div>

        <section class="island-grid">
          <v-btn
            v-for="i in displayedIslands"
            :key="i.shortName"
            class="island-card"
            :class="{ active: island.shortName === i.shortName }"
            :aria-label="i.shortName"
            :style="{
              '--card-image': `url(${islandImage({ island: i, background: true })})`
            }"
            color="secondary"
            @click="selectIsland(i)"
          >
            <div class="flex-top-left card-row">
              <v-img
                class="island-icon"
                :src="islandImage({ island: i, background: false })"
                :alt="`${filterIslandName(i.name)} icon`"
                width="24"
                height="24"
              />
              <div class="flex-column grow min-w-0 card-body">
                <div class="flex-wrap title-row">
                  <span class="text-body island-name grow min-w-0">{{ filterIslandName(i.name) }}</span>
                  <span v-if="i.expert" class="expert-chip text-small">EX</span>
                </div>
                <span class="text-small island-bonus">{{ areaBonus(i) }}% area bonus</span>
              </div>
            </div>
          </v-btn>
        </section>

        <v-row dense class="pa-2">
          <v-col cols="12">
            <span>Set your area bonus: </span>
            <a class="btn-link" href="/settings">Settings</a>
          </v-col>
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
              <div class="option-grid">
                <button
                  v-for="option in RANDOM_BONUS_OPTIONS"
                  :key="option.value"
                  type="button"
                  :aria-label="`random-bonus-${option.value}`"
                  :aria-pressed="randomBonus === option.value"
                  :class="['option-tile', 'flex-column-center', { active: randomBonus === option.value }]"
                  @click="selectRandomBonus(option.value)"
                >
                  <v-img :src="option.image" :alt="option.alt" width="32" height="32" />
                  <span class="text-small option-label">{{ option.label }}</span>
                  <span class="text-small option-hint">{{ option.hint }}</span>
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

<style scoped lang="scss">
$card-background-breakpoint: 460px;
$dialog-header-inline-breakpoint: 420px;

.grow {
  flex: 1 1 auto;
}

.min-w-0 {
  min-width: 0;
}

.expert-chip {
  flex: 0 0 auto;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 700 !important;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.island-activator {
  position: relative;
  display: inline-block;
}

.expert-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dialog-title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1.2;
  white-space: normal;
}

.expert-mode-toggle {
  flex: 0 0 auto;
}

@media (min-width: $dialog-header-inline-breakpoint) {
  .dialog-header {
    align-items: center;
  }
}

.island-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.island-icon {
  flex: 0 0 24px;
  border-radius: 4px;
}

.card-row {
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.card-body {
  gap: 2px;
  padding: 16px 0;
  justify-content: space-between;
  text-shadow: 0 0 1px #000;
  text-align: left;

  > .island-bonus {
    opacity: 0.7;
    line-height: 1.2;
  }
}

.title-row {
  align-items: baseline;
  gap: 6px;
  width: 100%;
}

.island-name {
  font-weight: 600 !important;
  line-height: 1.2;
  overflow-wrap: break-word;
  word-break: normal;
}

.island-card {
  justify-content: stretch;
  text-transform: none;
  letter-spacing: 0.03em;
  overflow: hidden;
  position: relative;
  min-height: 48px;
  height: auto !important;

  &::before {
    content: none;
  }

  :deep(.v-btn__content) {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &.active {
    box-shadow: 10px 0px 0px 1px rgb(var(--v-theme-primary)) inset;
  }
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.option-tile {
  gap: 2px;
  min-width: 0;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;

  .option-label {
    font-weight: 700 !important;
  }

  .option-hint {
    opacity: 0.7;
    line-height: 1.2;
  }

  :deep(.v-img) {
    flex: 0 0 auto;
    margin-bottom: 2px;
    opacity: 0.9;
  }

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5);
  }

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

    .option-hint {
      opacity: 0.85;
    }
  }
}

@media (min-width: $card-background-breakpoint) {
  .island-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .island-icon {
    display: none;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
    height: 100%;
    overflow: hidden;
  }

  .title-row {
    flex-wrap: nowrap;
    align-items: center;
  }

  .island-card {
    min-height: 80px;
    height: 80px !important;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      background-image: var(--card-image);
      background-repeat: no-repeat;
      background-position: right center;
      background-size: cover;
      pointer-events: none;
      z-index: 0;
      -webkit-mask-image: linear-gradient(
        to right,
        rgba(var(--v-theme-surface), 5%) 0%,
        rgba(var(--v-theme-surface), 30%) 64%,
        rgba(var(--v-theme-surface), 100%) 100%
      );
      mask-image: linear-gradient(
        to right,
        rgba(var(--v-theme-surface), 5%) 0%,
        rgba(var(--v-theme-surface), 30%) 64%,
        rgba(var(--v-theme-surface), 100%) 100%
      );
    }
  }
}
</style>
