<template>
  <v-dialog v-model="menu" max-width="500px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <v-img height="48" width="48" :src="islandImage({ island, background: false })" alt="island icon" />
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <v-card-title class="mb-1 pl-0">Select island or berries</v-card-title>

        <v-row>
          <v-col
            v-for="i in userStore.baseIslands"
            :key="i.shortName"
            :cols="12 / Math.min(3, ISLANDS.length)"
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
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { berry, ISLANDS, type Berry, type IslandInstance } from 'sleepapi-common'
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

watch(
  () => props.previousIsland,
  (newIsland) => {
    island.value = newIsland
  }
)

const areaBonus = (island: IslandInstance): number => Math.round((userStore.islandBonus(island.shortName) - 1) * 100)

const saveBerries = () => {
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

const clear = () => {
  island.value.berries = []
}

const selectAll = () => {
  island.value.berries = berries.value
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
  selectIsland
})
</script>

<style scoped>
.selected-island {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-primary));
  transform: scale(1.1);
}
</style>
