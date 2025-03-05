<template>
  <v-row class="mt-4">
    <v-col class="flex-center">
      <v-divider />
    </v-col>
    <v-col class="flex-center text-h6 text-no-wrap text-strength">Area Bonus</v-col>
    <v-col class="flex-center">
      <v-divider />
    </v-col>
  </v-row>

  <v-row dense class="">
    <v-col v-for="islandData in islandBonusData" :key="islandData.shortName">
      <v-avatar size="64">
        <v-img :src="islandImage({ island: islandData.island })" />
      </v-avatar>

      <span>{{ islandData.island.name }}</span>

      <NumberInput density="default" v-model="userStore.areaBonus[islandData.shortName]" :min="0" :max="100">
        <template #label>
          <span>Bonus</span>
        </template>
      </NumberInput>
      <!-- <v-text-field
        density="default"
        v-model="userStore.areaBonus[islandData.shortName]"
        :min="0"
        :max="100"
        label="Bonus"
      ></v-text-field> -->
    </v-col>
  </v-row>

  <v-row class="mt-4">
    <v-col class="flex-center">
      <v-divider />
    </v-col>
    <v-col class="flex-center text-h6 text-no-wrap text-strength">Recipe Bonus</v-col>
    <v-col class="flex-center">
      <v-divider />
    </v-col>
  </v-row>

  <v-row dense>
    <v-col cols="12" class="flex-center">
      <span>Set your recipe level: </span>
      <a class="btn-link" href="/recipes">Recipes</a>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { island } from 'sleepapi-common'
import { computed } from 'vue'

const userStore = useUserStore()

const islandBonusData = computed(() => {
  return island.ISLANDS.map((islandObj) => ({
    island: islandObj,
    shortName: islandObj.shortName as island.IslandShortName
  }))
})
</script>
