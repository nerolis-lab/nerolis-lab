<template>
  <v-row class="mt-4">
    <v-col class="flex-center">
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-h6 text-no-wrap text-strength">Area Bonus</v-col>
    <v-col class="flex-center">
      <v-divider />
    </v-col>
  </v-row>

  <v-row dense class="mx-2 justify-space-between">
    <v-col v-for="islandData in islandBonusData" :key="islandData.shortName" :cols="isMobile ? '12' : '5'">
      <v-row dense class="flex-center">
        <v-col cols="auto">
          <v-avatar size="54" class="mr-2">
            <v-img :src="islandImage({ island: islandData.island })" />
          </v-avatar>
        </v-col>

        <v-col>
          <span class="mr-2">{{ islandData.island.name }}</span>
        </v-col>

        <v-col cols="auto">
          <NumberInput
            density="default"
            v-model="userStore.areaBonus[islandData.shortName]"
            :rules="[rules.minBonusRule, rules.maxBonusRule]"
            :min="0"
            :max="MAX_ISLAND_BONUS"
            :loading="loadingStates[islandData.shortName]"
            @update-number="updateAreaBonus(islandData.shortName)"
          >
            <template #label>
              <span>Bonus</span>
            </template>
          </NumberInput>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row class="mt-4">
    <v-col class="flex-center">
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-h6 text-no-wrap text-strength">Recipe Bonus</v-col>
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
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { UserService } from '@/services/user/user-service'
import { islandImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { ISLANDS, MAX_ISLAND_BONUS, type IslandShortName } from 'sleepapi-common'
import { computed, reactive } from 'vue'

const userStore = useUserStore()

const rules = {
  minBonusRule: (value: number) => value >= 0 || 'Value must be at least 0',
  maxBonusRule: (value: number) => value <= MAX_ISLAND_BONUS || `Value must be ${MAX_ISLAND_BONUS} or less`
}

const loadingStates = reactive(
  Object.fromEntries(ISLANDS.map((i) => [i.shortName, false])) as Record<IslandShortName, boolean>
)

const islandBonusData = computed(() => {
  return ISLANDS.map((islandObj) => ({
    island: islandObj,
    shortName: islandObj.shortName as IslandShortName
  }))
})

const { isMobile } = useBreakpoint()

const updateAreaBonus = async (shortName: IslandShortName) => {
  loadingStates[shortName] = true
  await UserService.upsertAreaBonus(shortName, userStore.areaBonus[shortName])
  loadingStates[shortName] = false
}
</script>
