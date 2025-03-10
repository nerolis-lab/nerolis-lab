<template>
  <v-dialog v-model="menu" max-width="500px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <v-img height="48" width="48" :src="islandImage({ favoredBerries, background: false })" alt="island icon" />
      </v-btn>
    </template>

    <v-card>
      <v-container>
        <v-card-title class="mb-1 pl-0">Select island or berries</v-card-title>

        <v-row>
          <v-col
            v-for="i in islands"
            :key="i.shortName"
            :cols="12 / Math.min(3, islands.length)"
            class="flex-center flex-column text-center"
          >
            <v-btn icon color="transparent" size="64" :aria-label="`${i.shortName}`" @click="selectIsland(i)">
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
              <v-chip-group v-model="favoredBerries" column multiple selected-class="bg-primary">
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

<script lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { berry, ISLANDS, type Berry, type Island } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IslandSelect',
  props: {
    previousBerries: {
      type: Array<Berry>,
      default: []
    }
  },
  emits: ['favored-berries'],
  setup() {
    const userStore = useUserStore()
    return { islandImage, userStore, islands: ISLANDS }
  },
  data: () => ({
    menu: false,
    favoredBerries: [] as Berry[]
  }),
  computed: {
    berries() {
      return berry.BERRIES.sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  watch: {
    previousBerries: {
      handler(newBerries: Berry[]) {
        this.favoredBerries = newBerries
      },
      immediate: true
    }
  },
  methods: {
    areaBonus(island: Island): number {
      return this.userStore.areaBonus[island.shortName]
    },
    saveBerries() {
      this.menu = false
      this.updateBerries()
    },
    toggleBerry(berry: Berry) {
      const index = this.favoredBerries.findIndex((item) => item.name === berry.name)

      if (index === -1) {
        this.favoredBerries = this.favoredBerries.concat(berry)
      } else {
        this.favoredBerries = this.favoredBerries.filter((b) => b.name !== berry.name)
      }
    },
    clear() {
      this.favoredBerries = []
    },
    selectAll() {
      this.favoredBerries = this.berries
    },
    selectIsland(island: Island) {
      this.favoredBerries = island.berries
    },
    updateBerries() {
      this.$emit('favored-berries', this.favoredBerries)
    }
  }
})
</script>
