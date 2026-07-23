<template>
  <v-dialog v-model="menu" max-width="560px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <div class="badge-anchor">
          <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
          <span v-if="isExpertIsland" class="expert-chip expert-badge text-small" aria-label="expert mode">EX</span>
        </div>
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <div class="dialog-header flex-between flex-wrap">
          <v-card-title class="dialog-title pl-0">Island Settings</v-card-title>
          <v-switch
            v-model="expertToggle"
            aria-label="toggle expert mode"
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
            :aria-label="i.name"
            :style="{
              '--card-image': `url(${islandImage({ island: i, background: true })})`
            }"
            color="secondary"
            @click="selectIsland(i)"
          >
            <div class="card-mobile">
              <div class="card-mobile-info flex-column">
                <div class="flex-wrap title-row">
                  <span class="text-body island-name grow min-w-0">{{ filterIslandName(i.name) }}</span>
                  <span v-if="i.expert" class="expert-chip text-small">EX</span>
                </div>
                <span class="text-small island-bonus">{{ areaBonus(i) }}% area bonus</span>
              </div>
              <div class="card-mobile-divider" aria-hidden="true"></div>
              <v-avatar size="40" class="card-mobile-avatar">
                <v-img :src="islandImage({ island: i })" :alt="`${filterIslandName(i.name)} icon`" />
              </v-avatar>
            </div>
            <div class="flex-top-left card-row">
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
            <a class="settings-link btn-link" href="/settings">Settings</a>
          </v-col>
        </v-row>

        <template v-if="!isExpertIsland">
          <v-row dense>
            <v-col cols="12" class="flex-between berry-actions">
              <span class="berry-hint text-small">Selected berries</span>
              <div class="flex-right berry-actions">
                <v-btn color="secondary" size="small" aria-label="select all berries" @click="selectAll()">All</v-btn>
                <v-btn color="error-3" size="small" aria-label="clear berries" @click="clear()">Clear</v-btn>
              </div>
            </v-col>
            <v-col cols="12">
              <BerryGrid :berries="berries" :selection="islandBerryNames" @toggle-berry="toggleBerry" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="flex-right">
              <v-btn color="secondary" @click="saveBerries()">Save</v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-else>
          <v-row dense class="mt-2">
            <v-col cols="12">
              <div class="typography-h6 mb-1">Favorite berries</div>
              <FavoriteBerryPicker
                :berries="berries"
                :main="mainFavoriteBerry"
                :subs="subFavoriteBerries"
                @update:main="selectMainFavoriteBerry"
                @update:subs="selectSubFavoriteBerries"
              />
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12">
              <div class="typography-h6 mb-1">Weekly random bonus</div>
              <span class="bonus-caption text-small">
                Rolled each week; only Pokémon whose berry is favored gain the bonus
              </span>
              <div class="bonus-chips">
                <v-chip
                  v-for="option in RANDOM_BONUS_OPTIONS"
                  :key="option.value"
                  class="bonus-chip"
                  :class="{ active: randomBonus === option.value }"
                  :color="randomBonus === option.value ? option.color : undefined"
                  :aria-label="`random-bonus-${option.value}`"
                  :aria-pressed="randomBonus === option.value"
                  @click="selectRandomBonus(option.value)"
                >
                  <v-img class="bonus-chip-icon" :src="option.image" alt="" width="24" height="24" />
                  <span class="text-small bonus-chip-label">{{ option.label }}</span>
                </v-chip>
              </div>

              <v-sheet color="secondary" rounded class="bonus-detail">
                <v-btn
                  block
                  variant="text"
                  class="bonus-detail-toggle"
                  aria-label="toggle random bonus details"
                  :aria-expanded="showBonusDetails"
                  @click="showBonusDetails = !showBonusDetails"
                >
                  <span class="text-small bonus-detail-hint">{{ selectedBonusOption.hint }}</span>
                  <v-icon size="18" :icon="showBonusDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </v-btn>
                <v-expand-transition>
                  <div v-show="showBonusDetails">
                    <p class="text-small bonus-detail-text">{{ selectedBonusOption.detail }}</p>
                  </div>
                </v-expand-transition>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" class="flex-right">
              <v-btn color="secondary" :disabled="!mainFavoriteBerry" @click="saveBerries()">Save</v-btn>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import BerryGrid from '@/components/map/berry-favorites/berry-grid.vue'
import FavoriteBerryPicker from '@/components/map/berry-favorites/favorite-berry-picker.vue'
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import {
  BASE_FAVORED_BERRY_MULTIPLIER,
  berry,
  EXPERT_ISLANDS,
  EXPERT_MODE_BERRY_BONUS_MULTIPLIER,
  ISLANDS,
  MAX_SUB_FAVORITE_BERRIES,
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
  detail: string
  color: string
  image: string
}> = [
  {
    value: 'ingredient',
    label: 'Ingredient',
    hint: '+1-2 ingredients',
    detail:
      'Favored helpers will have 1 extra ingredient each time they bring you ingredients, ' +
      'with favored Ingredient specialists having a 50% chance to bring you 2 extra instead.',
    color: 'ingredient',
    image: '/images/ingredient/ingredients.png'
  },
  {
    value: 'berry',
    label: 'Berry',
    hint: `${EXPERT_MODE_BERRY_BONUS_MULTIPLIER}x favorite berry power`,
    detail: `Favored berries are worth ${EXPERT_MODE_BERRY_BONUS_MULTIPLIER}x their normal power instead of ${BASE_FAVORED_BERRY_MULTIPLIER}x.`,
    color: 'berry',
    image: '/images/berries/berries.png'
  },
  {
    value: 'skill',
    label: 'Skill',
    hint: '1.25x main skill chance',
    detail: 'Main skills of favored helpers are 1.25x more likely to trigger.',
    color: 'skill',
    image: '/images/misc/skillproc.png'
  }
]

const showBonusDetails = ref(false)

const defaultExpertMode = (): ExpertModeSettings => ({
  mainFavoriteBerry: berries.value[0],
  subFavoriteBerries: [],
  randomBonus: 'ingredient'
})

// A fresh expert island keeps expertMode unset until the user picks something
const initIsland = (input: IslandInstance): IslandInstance => {
  if (input.expert) {
    return {
      ...input,
      berries: [...input.berries],
      expertMode: input.expertMode && {
        ...input.expertMode,
        subFavoriteBerries: [...input.expertMode.subFavoriteBerries]
      }
    }
  }
  return { ...input, berries: [...input.berries] }
}

const island = ref<IslandInstance>(initIsland(props.previousIsland))

const islandBerryNames = computed(() => island.value.berries.map((b) => b.name))

const selectableIslands = computed<IslandInstance[]>(() => [...userStore.baseIslands, ...userStore.expertIslands])

const isExpertIsland = computed(() => island.value.expert === true)

const expertToggle = ref(isExpertIsland.value)

const displayedIslands = computed<IslandInstance[]>(() =>
  selectableIslands.value.filter((i) => (expertToggle.value ? i.expert : !i.expert))
)

// Draft state allows an empty main while editing; expertMode keeps the last valid pick
const draftMain = ref('')
const draftSubs = ref<string[]>([])

const syncDraft = (i: IslandInstance) => {
  draftMain.value = i.expert ? (i.expertMode?.mainFavoriteBerry.name ?? '') : ''
  draftSubs.value = i.expert ? (i.expertMode?.subFavoriteBerries.map((b) => b.name) ?? []) : []
}
syncDraft(island.value)

const mainFavoriteBerry = computed(() => (island.value.expert ? draftMain.value : ''))
const subFavoriteBerries = computed(() => (island.value.expert ? draftSubs.value : []))
const randomBonus = computed<ExpertRandomBonusType>(() =>
  island.value.expert ? (island.value.expertMode?.randomBonus ?? 'ingredient') : 'ingredient'
)

const selectedBonusOption = computed(
  () => RANDOM_BONUS_OPTIONS.find((option) => option.value === randomBonus.value) ?? RANDOM_BONUS_OPTIONS[0]
)

const resetToIsland = (source: IslandInstance) => {
  island.value = initIsland(source)
  expertToggle.value = source.expert === true
  syncDraft(island.value)
}

watch(
  () => props.previousIsland,
  (newIsland) => resetToIsland(newIsland)
)

// Closing without saving discards edits so the dialog and activator mirror the
// actual team state; after a save the prop already holds the saved island
watch(menu, (open) => {
  if (!open) {
    resetToIsland(props.previousIsland)
  }
})

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
  emit('update-island', island.value)
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
  if (newIsland.shortName === island.value.shortName) return
  island.value = initIsland(newIsland)
  expertToggle.value = island.value.expert === true
  syncDraft(island.value)
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

const selectMainFavoriteBerry = (berryName: string) => {
  if (berryName.length === 0) {
    draftMain.value = ''
    return
  }
  const selected = berries.value.find((b) => b.name === berryName)
  if (!selected) return

  draftMain.value = selected.name
  draftSubs.value = draftSubs.value.filter((name) => name !== selected.name)

  const expertMode = ensureExpertMode()
  expertMode.mainFavoriteBerry = selected
  expertMode.subFavoriteBerries = expertMode.subFavoriteBerries.filter((b) => b.name !== selected.name)
}

const selectSubFavoriteBerries = (berryNames: string[]) => {
  const names = berryNames.filter((name) => name !== draftMain.value && berries.value.some((b) => b.name === name))
  draftSubs.value = names.slice(0, MAX_SUB_FAVORITE_BERRIES)

  const expertMode = ensureExpertMode()
  expertMode.subFavoriteBerries = berries.value.filter((b) => draftSubs.value.includes(b.name))
}

const selectRandomBonus = (value: string) => {
  if (value !== 'ingredient' && value !== 'berry' && value !== 'skill') return
  const expertMode = ensureExpertMode()
  expertMode.randomBonus = value
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
  selectedBonusOption,
  showBonusDetails,
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
$card-background-breakpoint: 500px;
$mobile-layout-breakpoint: 400px;

.grow {
  flex: 1 1 auto;
}

.min-w-0 {
  min-width: 0;
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

.island-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.card-row {
  display: none;
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
  min-height: 60px;
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
    box-shadow: 0 0 0 2px rgb(var(--v-theme-primary)) inset;
  }
}

.card-mobile {
  display: grid;
  grid-template-columns: 1fr 1px 40px;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 10px 0;
}

.card-mobile-info {
  gap: 3px;
  text-align: left;
  min-width: 0;
  overflow: hidden;

  .island-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .island-bonus {
    opacity: 0.7;
    line-height: 1.2;
    white-space: nowrap;
  }
}

.card-mobile-divider {
  width: 100%;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 1px;
}

.card-mobile-avatar {
  justify-self: center;
}

@media (min-width: $mobile-layout-breakpoint) {
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
        rgba(var(--v-theme-surface), 5%) 10%,
        rgba(var(--v-theme-surface), 40%) 60%,
        rgba(var(--v-theme-surface), 100%) 90%
      );
      mask-image: linear-gradient(
        to right,
        rgba(var(--v-theme-surface), 5%) 10%,
        rgba(var(--v-theme-surface), 40%) 60%,
        rgba(var(--v-theme-surface), 100%) 90%
      );
    }

    &.active {
      box-shadow: 10px 0px 0px 1px rgb(var(--v-theme-primary)) inset;
    }
  }

  .card-mobile {
    display: none;
  }

  .card-row {
    display: flex;
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
}

.settings-link {
  display: inline-block;
}

.berry-actions {
  align-items: center;
  gap: 8px;
}

.berry-hint {
  opacity: 0.7;
  padding-left: 2px;
}

.bonus-caption {
  display: block;
  opacity: 0.7;
  padding-left: 2px;
  line-height: 1.3;
}

.bonus-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.bonus-chip {
  .bonus-chip-icon {
    flex: 0 0 auto;
    margin-right: 6px;
  }

  .bonus-chip-label {
    font-weight: 600 !important;
  }

  &.active {
    box-shadow: 0 0 0 1.5px currentColor inset;
  }
}

.bonus-detail {
  margin-top: 8px;
}

.bonus-detail-toggle {
  text-transform: none;
  letter-spacing: normal;

  :deep(.v-btn__content) {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }
}

.bonus-detail-hint {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.bonus-detail-text {
  padding: 0 12px 10px;
  opacity: 0.85;
  line-height: 1.4;
}

@media (min-width: $card-background-breakpoint) {
  .island-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
