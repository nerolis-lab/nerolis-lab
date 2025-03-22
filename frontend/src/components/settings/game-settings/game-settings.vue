<template>
  <template v-if="!isLoggedIn">
    <v-row dense class="mx-2 mt-4">
      <v-col class="flex-center"> Changing your game settings requires you to be logged in. </v-col>
    </v-row>
  </template>
  <template v-else>
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
              :disabled="!isLoggedIn"
              :rules="[rules.minBonusRule, rules.maxBonusRule]"
              :min="0"
              :max="MAX_ISLAND_BONUS"
              :loading="loadingStates[islandData.shortName]"
              append-icon=""
              suffix="%"
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

    <v-row class="mt-4">
      <v-col class="flex-center">
        <v-divider />
      </v-col>
      <v-col cols="auto" class="flex-center text-h6 text-no-wrap text-strength">Pot Size</v-col>
      <v-col class="flex-center">
        <v-divider />
      </v-col>
    </v-row>

    <v-row dense class="mt-4 flex-center">
      <v-col cols="auto" class="flex-center">
        <v-btn icon @click="setPotSize(MIN_POT_SIZE)">Min</v-btn>
      </v-col>
      <v-col cols="auto" class="flex-center">
        <v-btn icon="mdi-minus" @click="decreasePotSize" />
      </v-col>
      <v-col class="pot-size-input">
        <NumberInput
          v-model="userStore.potSize"
          :min="MIN_POT_SIZE"
          :max="MAX_POT_SIZE"
          :step="3"
          :loading="loadingPotSize"
          @update-number="updatePotSize"
          density="comfortable"
        >
          <template #label>Size</template>
        </NumberInput>
      </v-col>
      <v-col cols="auto" class="flex-center">
        <v-btn icon="mdi-plus" @click="increasePotSize" />
      </v-col>
      <v-col cols="auto" class="flex-center">
        <v-btn icon @click="setPotSize(MAX_POT_SIZE)">Max</v-btn>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" class="flex-center text-center fine-print">
        Calculations will use this as your baseline and apply any relevant bonuses, such as Good Camp Tickets or Pokémon
        skills, on top of this.
      </v-col>
    </v-row>
  </template>
</template>

<script setup lang="ts">
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { UserService } from '@/services/user/user-service'
import { islandImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { ISLANDS, MAX_ISLAND_BONUS, MAX_POT_SIZE, MIN_POT_SIZE, type IslandShortName } from 'sleepapi-common'
import { computed, reactive, ref } from 'vue'

const userStore = useUserStore()
const teamStore = useTeamStore()
const isLoggedIn = computed(() => userStore.loggedIn)

const rules = {
  minBonusRule: (value: number) => value >= 0 || 'Value must be at least 0',
  maxBonusRule: (value: number) => value <= MAX_ISLAND_BONUS || `Value must be ${MAX_ISLAND_BONUS} or less`
}

const loadingStates = reactive(
  Object.fromEntries(ISLANDS.map((i) => [i.shortName, false])) as Record<IslandShortName, boolean>
)

const loadingPotSize = ref(false)

const islandBonusData = computed(() => {
  return ISLANDS.map((islandObj) => ({
    island: islandObj,
    shortName: islandObj.shortName as IslandShortName
  }))
})

const { isMobile } = useBreakpoint()

let debounceTimer: ReturnType<typeof setTimeout> | undefined

async function updateAreaBonus(shortName: IslandShortName) {
  loadingStates[shortName] = true
  await UserService.upsertAreaBonus(shortName, userStore.areaBonus[shortName])
  loadingStates[shortName] = false
}

async function updatePotSize() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(async () => {
    loadingPotSize.value = true
    await UserService.upsertUserSettings(userStore.potSize)
    teamStore.clearCalculatorCache()
    loadingPotSize.value = false
    debounceTimer = undefined
  }, 500)
}

function increasePotSize() {
  if (userStore.potSize < MAX_POT_SIZE) {
    if (userStore.potSize + 3 > MAX_POT_SIZE) {
      userStore.potSize = MAX_POT_SIZE
    } else {
      userStore.potSize += 3
    }
    updatePotSize()
  }
}

function decreasePotSize() {
  if (userStore.potSize > MIN_POT_SIZE) {
    if (userStore.potSize - 3 < MIN_POT_SIZE) {
      userStore.potSize = MIN_POT_SIZE
    } else {
      userStore.potSize -= 3
    }
    updatePotSize()
  }
}

function setPotSize(size: number) {
  userStore.potSize = size
  updatePotSize()
}
</script>

<style lang="scss" scoped>
.pot-size-input {
  max-width: 100px;
}
</style>
