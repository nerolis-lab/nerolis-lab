<template>
  <v-dialog v-model="menu" max-width="500px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <v-card-title class="card-title">
          Island Settings
          <v-switch v-model="expertMode" label="Expert Mode" color="primary" hide-details="auto"></v-switch>
        </v-card-title>

        <v-row>
          <v-col
            v-for="i in availableIslands"
            :key="i.shortName"
            :cols="12 / Math.min(3, availableIslands.length)"
            class="flex-center flex-column text-center"
          >
            <v-btn
              icon
              size="64"
              :aria-label="`${i.shortName}`"
              :class="island.shortName === i.shortName ? 'selected-island' : ''"
              @click="selectIsland(i)"
            >
              <v-avatar size="64">
                <v-img :src="`/images/island/${i.shortName}.png`" :alt="`${i.shortName} icon`" />
              </v-avatar>
            </v-btn>
            <span class="text-body-1 text-no-wrap mt-1">{{ areaBonus(i) }}%</span>
          </v-col>
        </v-row>

        <v-row dense class="pa-2">
          <span>Set your area bonus: </span>
          <a class="btn-link" href="/settings">Settings</a>
        </v-row>

        <!-- Expert mode settings -->
        <template v-if="expertMode">
          <!-- Main favorite berry (1 berry) -->
          <v-row dense>
            <v-col cols="12">
              <span class="text-body-2">Main Favorite Berry (1)</span>
            </v-col>
            <v-col cols="12">
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group v-model="mainFavoriteBerry" column selected-class="bg-primary">
                  <v-chip v-for="berry in berries" :key="berry.name" :value="berry" class="ma-1">
                    <v-avatar size="24">
                      <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                    </v-avatar>
                  </v-chip>
                </v-chip-group>
              </v-sheet>
            </v-col>
          </v-row>

          <!-- Sub-favorite berries (2 berries) -->
          <v-row dense>
            <v-col cols="12">
              <span class="text-body-2">Sub-Favorite Berries (2)</span>
            </v-col>
            <v-col cols="12">
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
            </v-col>
          </v-row>

          <!-- Bonus selection -->
          <v-row dense>
            <v-col cols="12">
              <span class="text-body-2">Random Bonus</span>
            </v-col>
            <v-col cols="12">
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group v-model="expertModifier" column mandatory selected-class="bg-primary">
                  <v-chip value="skill" class="ma-1" @click="expertModifier = 'skill'"> Skill </v-chip>
                  <v-chip value="ingredient" class="ma-1" @click="expertModifier = 'ingredient'"> Ingredient </v-chip>
                  <v-chip value="berry" class="ma-1" @click="expertModifier = 'berry'"> Berry </v-chip>
                </v-chip-group>
              </v-sheet>
            </v-col>
          </v-row>
        </template>

        <!-- Regular mode settings -->
        <template v-else>
          <v-row dense>
            <v-col cols="12">
              <v-sheet color="secondary" rounded style="overflow-y: auto">
                <v-chip-group v-model="island.berries" column multiple selected-class="bg-primary">
                  <v-chip v-for="berry in berries" :key="berry.name" :value="berry" class="ma-1">
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

        <!-- Save button for expert mode -->
        <v-row v-if="expertMode">
          <v-col cols="12" class="flex-right">
            <v-btn color="secondary" aria-label="save button" @click="saveBerries()">Save</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
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

<style scoped>
.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-island {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-primary));
  transform: scale(1.1);
}
</style>
