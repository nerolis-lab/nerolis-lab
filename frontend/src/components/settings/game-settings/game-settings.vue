<template>
  <template v-if="!isLoggedIn">
    <SettingsCard title="Game Settings" icon="mdi-information">
      <p class="mb-4">Changing your game settings requires you to be logged in.</p>
    </SettingsCard>
  </template>

  <template v-else>
    <div class="game-settings-container">
      <SettingsCard title="Area Bonus" icon="mdi-map-marker">
        <v-row dense class="mx-2 flex-left">
          <div class="area-and-bonus" v-for="islandData in islandBonusData" :key="islandData.shortName">
            <v-avatar size="54" class="mr-2 area-image">
              <v-img :src="islandImage({ island: islandData.island })" />
            </v-avatar>

            <div class="mr-2 area-name">{{ islandData.island.name }}</div>

            <NumberInput
              class="area-bonus-input"
              density="default"
              v-model="userStore.islands[islandData.shortName].areaBonus"
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
          </div>
        </v-row>
      </SettingsCard>

      <SettingsCard title="Recipe Bonus" icon="mdi-chef-hat">
        <v-row dense>
          <v-col cols="12" class="flex-left">
            <span>Set your recipe levels: </span>
            <a class="btn-link" href="/recipes">Recipes</a>
          </v-col>
        </v-row>
      </SettingsCard>

      <SettingsCard title="Pot Size" icon="mdi-pot">
        <v-row dense class="flex-top-left">
          <v-col cols="auto">
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
              :hide-details="false"
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
          <v-col cols="12" class="fine-print">
            Calculations will use this as your baseline and apply any relevant bonuses, such as Good Camp Tickets or
            Pokémon skills, on top of this.
          </v-col>
        </v-row>
      </SettingsCard>
    </div>
  </template>
</template>

<script setup lang="ts">
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import SettingsCard from '@/components/settings/settings-card.vue'
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

let debounceTimer: ReturnType<typeof setTimeout> | undefined

async function updateAreaBonus(shortName: IslandShortName) {
  loadingStates[shortName] = true
  await UserService.upsertAreaBonus(shortName, userStore.islands[shortName].areaBonus)
  loadingStates[shortName] = false
}

async function updatePotSize() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(async () => {
    loadingPotSize.value = true
    await UserService.upsertUserSettings({ potSize: userStore.potSize })
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

.game-settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.area-and-bonus {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-basis: 400px;

  @media (max-width: 340px) {
    flex-direction: column;
    gap: 10px;
  }

  .area-name {
    flex: 1 1 auto;
  }

  .area-bonus-input {
    flex: 0 0 auto;
  }
}
</style>
