<template>
  <v-dialog v-model="menu" max-width="500px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
      </v-btn>
    </template>

    <v-sheet class="island-select-sheet">
      <div class="island-select-title text-h5">
        <h3 class="text-h5">Island Settings</h3>
        <v-switch v-model="expertMode" label="Expert Mode" color="primary" hide-details="auto"></v-switch>
      </div>

      <section class="islands">
        <v-btn
          v-for="i in availableIslands"
          :key="i.shortName"
          class="island selection-button"
          :active="island.shortName === i.shortName"
          :aria-label="`Select ${i.shortName} island`"
          color="secondary"
          height="80"
          width="220"
          @click="selectIsland(i)"
        >
          <div class="island-text">
            <div class="island-name">{{ filterIslandName(i.name) }}</div>
            <small>{{ areaBonus(i) }}% area bonus</small>
          </div>
          <v-img height="72" width="72" :src="`/images/island/${i.shortName}.png`" :alt="`${i.shortName} icon`"></v-img>
        </v-btn>
      </section>

      <!-- Expert mode settings -->
      <template v-if="expertMode">
        <!-- Main favorite berry (1 berry) -->
        <section class="main-favorite-berry favorite-berry-selector">
          <div>Main Favorite Berry (1)</div>
          <v-sheet color="secondary" rounded style="overflow-y: auto">
            <v-chip-group v-model="mainFavoriteBerry" column selected-class="bg-primary">
              <v-chip v-for="berry in berries" :key="berry.name" :value="berry" class="ma-1">
                <v-avatar size="24">
                  <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                </v-avatar>
              </v-chip>
            </v-chip-group>
          </v-sheet>
        </section>
        <!-- Sub-favorite berries (2 berries) -->
        <section class="sub-favorite-berries favorite-berry-selector">
          <div>Sub-Favorite Berries (2)</div>
          <v-sheet color="secondary" rounded style="overflow-y: auto">
            <v-chip-group v-model="subFavoriteBerries" column multiple selected-class="bg-primary">
              <v-chip
                v-for="berry in berries"
                :key="berry.name"
                :value="berry"
                :disabled="
                  !!(mainFavoriteBerry && berry.name === mainFavoriteBerry.name) ||
                  (subFavoriteBerries.length >= 2 && !subFavoriteBerries.find((b) => b.name === berry.name))
                "
                class="ma-1"
              >
                <v-avatar size="24">
                  <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                </v-avatar>
              </v-chip>
            </v-chip-group>
          </v-sheet>
        </section>
        <!-- Bonus selection -->
        <section class="random-bonus">
          <div>Expert Modifier</div>
          <div class="expert-modifier-options">
            <v-btn
              stacked
              width="150"
              height="100"
              color="secondary"
              class="expert-modifier-option selection-button"
              :class="expertModifier === 'skill' ? 'selected' : ''"
              @click="setExpertModifier('skill')"
            >
              <div class="modifier-name text-skill">Skill</div>
              <small>1.25x main skill chance</small>
            </v-btn>
            <v-btn
              stacked
              width="150"
              height="100"
              color="secondary"
              class="expert-modifier-option selection-button"
              :class="expertModifier === 'ingredient' ? 'selected' : ''"
              @click="setExpertModifier('ingredient')"
            >
              <div class="modifier-name text-ingredient">Ingredient</div>
              <small>+1 ingredient, sometimes +2</small>
            </v-btn>
            <v-btn
              stacked
              width="150"
              height="100"
              color="secondary"
              class="expert-modifier-option selection-button"
              :class="expertModifier === 'berry' ? 'selected' : ''"
              @click="setExpertModifier('berry')"
            >
              <div class="modifier-name text-berry">Berry</div>
              <small>2.4x favorite berry power</small>
            </v-btn>
          </div>
        </section>
      </template>

      <!-- Regular mode settings -->
      <template v-else>
        <div class="area-bonus">Set your area bonuses: <a class="btn-link" href="/settings">Settings</a></div>
        <v-divider color="accent" opacity="0.5" />
        <section class="favorite-berries">
          <!-- Selection UI only for Greengrass -->
          <div class="selected-berries-display">
            <div>Favorite Berries:</div>
            <div class="selected-berry" v-for="berry in island.berries" v-if="island.berries.length < 4">
              <div class="selected-berry-name">{{ berry.type }}</div>
              <v-img
                :key="berry.name"
                :src="`/images/berries/${berry.name.toLowerCase()}.png`"
                width="24"
                height="24"
                class="berry-image"
              />
            </div>
          </div>
          <v-sheet color="secondary" rounded style="overflow-y: auto">
            <v-chip-group v-model="island.berries" column multiple selected-class="bg-primary">
              <v-btn class="mx-1" color="surface" rounded aria-label="clear button" @click="clear()" v-if="isGreengrass"
                >Clear</v-btn
              >
              <v-btn
                class="mx-1"
                color="surface"
                rounded
                aria-label="select all button"
                @click="selectAll()"
                v-if="isGreengrass"
                >All</v-btn
              >
              <v-chip v-for="berry in berries" :key="berry.name" :value="berry" class="ma-1">
                <v-avatar size="24">
                  <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                </v-avatar>
              </v-chip>
            </v-chip-group>
          </v-sheet>
        </section>

        <section class="modal-footer">
          <v-btn color="secondary" aria-label="save button" @click="saveBerries()">Save</v-btn>
        </section>
      </template>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import {
  berry,
  getBaseIslandName,
  getExpertIslandName,
  type Berry,
  type ExpertRandomBonusType,
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
const island = ref<IslandInstance>(props.previousIsland)

const berries = computed(() => berry.BERRIES.sort((a, b) => a.name.localeCompare(b.name)))

// Initialize expert mode based on the current island
const expertMode = ref(props.previousIsland.expert ?? false)

// Expert mode state
const mainFavoriteBerry = ref<Berry | null>(null)
const subFavoriteBerries = ref<Berry[]>([])
const expertModifier = ref<ExpertRandomBonusType>(island.value.expertModifier ?? 'skill')

const availableIslands = computed(() => {
  return expertMode.value ? userStore.expertIslands : userStore.baseIslands
})

const isGreengrass = computed(() => {
  return island.value.shortName === 'greengrass'
})

watch(
  () => props.previousIsland,
  (newIsland) => {
    island.value = newIsland
    expertMode.value = newIsland.expert ?? false
    initializeExpertModeSettings()
  }
)

// Initialize expert mode settings from island data
const initializeExpertModeSettings = () => {
  if (expertMode.value && island.value.berries.length > 0) {
    // Assume first berry is main, rest are sub (max 2)
    mainFavoriteBerry.value = island.value.berries[0] || null
    subFavoriteBerries.value = island.value.berries.slice(1, 3)
    expertModifier.value = island.value.expertModifier ?? 'skill'
  } else {
    mainFavoriteBerry.value = null
    subFavoriteBerries.value = []
    expertModifier.value = 'skill'
  }
}

// Initialize on mount
initializeExpertModeSettings()

// Watch expert mode toggle and switch islands accordingly
watch(expertMode, (newExpertMode) => {
  if (newExpertMode) {
    // Toggled ON: try to find expert version of current island, or select first expert island
    const expertShortName = getExpertIslandName(island.value.shortName)
    if (expertShortName && expertShortName in userStore.islands) {
      island.value = userStore.islands[expertShortName]
    } else if (userStore.expertIslands.length > 0) {
      island.value = userStore.expertIslands[0]
    }
  } else {
    // Toggled OFF: find base version of current expert island, or select first base island
    const baseShortName = getBaseIslandName(island.value.shortName)
    if (baseShortName in userStore.islands) {
      island.value = userStore.islands[baseShortName]
    } else if (userStore.baseIslands.length > 0) {
      island.value = userStore.baseIslands[0]
    }
  }
  initializeExpertModeSettings()
})

const areaBonus = (island: IslandInstance): number => Math.round((userStore.islandBonus(island.shortName) - 1) * 100)

// Filter island name to remove "(Expert Mode)" if present
const filterIslandName = (name: string): string => {
  return name.replace(/\s*\(Expert Mode\)\s*/gi, '').trim()
}

const saveBerries = () => {
  if (expertMode.value) {
    // Expert mode: combine main + sub berries, set expertModifier
    if (mainFavoriteBerry.value) {
      island.value.berries = [mainFavoriteBerry.value, ...subFavoriteBerries.value]
    } else {
      island.value.berries = subFavoriteBerries.value
    }
    island.value.expertModifier = expertModifier.value
  }
  menu.value = false
  updateBerries()
}

const toggleBerry = (berry: Berry) => {
  const index = island.value.berries.findIndex((item) => item.name === berry.name)

  if (index === -1) {
    island.value.berries = island.value.berries.concat(berry)
  } else {
    island.value.berries = island.value.berries.filter((b) => b.name !== berry.name)
  }
}

// Flag to prevent recursive updates
const isUpdatingBerries = ref(false)

// Watch main favorite berry changes to remove from sub-favorites
watch(mainFavoriteBerry, (newMain, oldMain) => {
  if (isUpdatingBerries.value) return
  if (newMain && newMain.name !== oldMain?.name) {
    const filtered = subFavoriteBerries.value.filter((b) => b.name !== newMain.name)
    if (filtered.length !== subFavoriteBerries.value.length) {
      isUpdatingBerries.value = true
      subFavoriteBerries.value = filtered
      isUpdatingBerries.value = false
    }
  }
})

// Watch sub-favorite berries to enforce limit and remove main berry
watch(
  subFavoriteBerries,
  (newSubs) => {
    if (isUpdatingBerries.value) return

    let needsUpdate = false
    let updated = [...newSubs]

    // Enforce limit of 2
    if (updated.length > 2) {
      updated = updated.slice(0, 2)
      needsUpdate = true
    }

    // Remove main berry if it was added to subs
    if (mainFavoriteBerry.value) {
      const beforeFilter = updated.length
      updated = updated.filter((b) => b.name !== mainFavoriteBerry.value?.name)
      if (updated.length !== beforeFilter) {
        needsUpdate = true
      }
    }

    // Only update if something changed
    if (needsUpdate) {
      isUpdatingBerries.value = true
      subFavoriteBerries.value = updated
      isUpdatingBerries.value = false
    }
  },
  { deep: true }
)

const clear = () => {
  if (expertMode.value) {
    mainFavoriteBerry.value = null
    subFavoriteBerries.value = []
  } else {
    island.value.berries = []
  }
}

const selectAll = () => {
  if (!expertMode.value) {
    island.value.berries = berries.value
  }
}

const selectIsland = (newIsland: IslandInstance) => {
  island.value = newIsland
}

const setExpertModifier = (modifier: ExpertRandomBonusType) => {
  expertModifier.value = modifier
}

const updateBerries = () => {
  emit('update-island', island.value)
}

// Expose methods and data for testing
defineExpose({
  menu,
  island,
  berries,
  areaBonus,
  saveBerries,
  toggleBerry,
  clear,
  selectAll,
  selectIsland,
  availableIslands,
  mainFavoriteBerry,
  subFavoriteBerries,
  expertModifier
})
</script>

<style lang="scss">
.island-select-sheet {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;

  .v-btn.selection-button {
    letter-spacing: 0.03em;
    text-indent: 0;

    &:not(.v-btn--stacked) {
      grid-template-columns: 0 1fr 0;
    }

    &.v-btn--stacked {
      grid-template-rows: 0 1fr 0;
      padding: 8px 16px;
    }

    &.v-btn--active {
      --v-activated-opacity: 0;
      background-color: $secondary-dark !important;
      border: 1px solid $secondary !important;
    }

    .v-btn__content {
      height: 100%;
      width: 100%;
      gap: 8px;
    }

    small {
      font-size: 14px;
      color: rgba(#fff, 0.5);
    }
  }

  .island-select-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  section {
    display: flex;
  }

  .islands {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;

    .island {
      padding: 0 4px 0 16px;
      justify-content: stretch;

      .v-btn__content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .island-text {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px 0;

          .island-name {
            word-wrap: break-word;
            white-space: normal;
            text-align: left;
          }
        }

        .v-img {
          flex-grow: 0;
          flex-shrink: 0;
        }
      }
    }
  }

  .favorite-berries {
    display: flex;
    flex-direction: column;

    .berry-selection-buttons {
      display: flex;
      gap: 8px;
      padding: 8px;
      justify-content: flex-start;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 8px;
    }
  }

  .selected-berries-display {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 8px;

    .selected-berry {
      display: flex;
      gap: 4px;

      .selected-berry-name {
        text-transform: capitalize;

        // @media (max-width: 400px) {
        //   display: none;
        // }
      }

      .berry-image {
        flex-grow: 0;
      }
    }
  }

  .random-bonus {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .expert-modifier-options {
      display: flex;
      justify-content: space-between;

      .v-btn__content {
        gap: 8px;
        justify-content: space-between;
        align-items: flex-start;
        text-align: left;
      }
    }

    //   .expert-modifier-option {
    //     flex-basis: 33%;
    //     display: flex;
    //     flex-direction: column;
    //     align-items: flex-start;
    //     padding: 16px;
    //     text-decoration: none;
    //     border-radius: 24px;
    //     transition: all 0.2s ease-in-out;
    //     background-color: $secondary;

    //     &:hover {
    //       background-color: $secondary-medium-dark;
    //     }

    //     &.selected {
    //       background-color: $secondary-dark;
    //     }
    //   }
  }

  .area-bonus {
    display: flex;
    align-items: center;
  }

  .modal-footer {
    justify-content: space-between;
    align-items: center;
  }
}
</style>
