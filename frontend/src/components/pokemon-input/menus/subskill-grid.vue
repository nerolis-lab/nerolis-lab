<template>
  <div>
    <!-- Choose the subskill for level -->
    <v-row>
      <v-col :cols="quickMode ? 9 : 12" class="py-5">
        <div v-if="lowestAvailableLevel" style="height: 50px">
          <CustomLabel class="text-left-override">
            <v-badge location="right" color="primary" rounded="lg" :content="lowestAvailableLevel" offset-x="-15">
              <span>Choose the subskill for level</span>
            </v-badge>
          </CustomLabel>
        </div>
        <div v-else style="height: 50px">
          <CustomLabel> Click a selected subskill to replace it </CustomLabel>
        </div>
      </v-col>
      <v-col v-if="quickMode" cols="3" class="py-5 flex-center">
        <v-btn 
          size="small" 
          color="surface" 
          rounded="lg"
          @click="resetSubskills"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>

    <!-- Golden subskills -->
    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.BERRY_FINDING_S"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.BERRY_FINDING_S)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.HELPING_BONUS"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.HELPING_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.ENERGY_RECOVERY_BONUS"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.ENERGY_RECOVERY_BONUS)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.SLEEP_EXP_BONUS"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.SLEEP_EXP_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.DREAM_SHARD_BONUS"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.DREAM_SHARD_BONUS)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.RESEARCH_EXP_BONUS"
          :selected-subskills="currentSubskills"
          @click="toggleSubskill(availableSubskills.RESEARCH_EXP_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Helping Speed </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.HELPING_SPEED_S"
          :selected-subskills="currentSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.HELPING_SPEED_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.HELPING_SPEED_M"
          :selected-subskills="currentSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.HELPING_SPEED_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Ingredient Finder </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.INGREDIENT_FINDER_S"
          :selected-subskills="currentSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.INGREDIENT_FINDER_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.INGREDIENT_FINDER_M"
          :selected-subskills="currentSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.INGREDIENT_FINDER_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Skill Trigger </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_TRIGGER_S"
          :selected-subskills="currentSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.SKILL_TRIGGER_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_TRIGGER_M"
          :selected-subskills="currentSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.SKILL_TRIGGER_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Inventory Up </CustomLabel> </v-col>
      <v-col cols="2" class="flex-center pr-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_S"
          :selected-subskills="currentSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_S)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1 pr-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_M"
          :selected-subskills="currentSubskills"
          label="M"
          class="rounded-t-0 rounded-b-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_M)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_L"
          :selected-subskills="currentSubskills"
          label="L"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_L)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Skill Level Up </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_LEVEL_UP_S"
          :selected-subskills="currentSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.SKILL_LEVEL_UP_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_LEVEL_UP_M"
          :selected-subskills="currentSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.SKILL_LEVEL_UP_M)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import CustomLabel from '@/components/custom-components/custom-label.vue'
import SubskillButton from '@/components/pokemon-input/menus/subskill-button.vue'
import { type Subskill, type SubskillInstanceExt } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{
  currentSubskills: SubskillInstanceExt[]
  availableSubskills: any
  quickMode?: boolean
}>()
const emit = defineEmits<{
  'update-subskills': [subskills: SubskillInstanceExt[]]
}>()

const availableLevels = [10, 25, 50, 75, 100]

const lowestAvailableLevel = computed(() => {
  const usedLevels = props.currentSubskills.map((s) => s.level)
  return availableLevels.find((level) => !usedLevels.includes(level))
})

const toggleSubskill = (ss: Subskill) => {
  const currentSkills = [...props.currentSubskills]
  const index = currentSkills.findIndex(
    (s) => s.subskill.name.toLowerCase() === ss.name.toLowerCase()
  )

  if (index !== -1) {
    // Subskill is already selected, remove it
    currentSkills.splice(index, 1)
  } else {
    const availableLevel = lowestAvailableLevel.value

    if (availableLevel !== undefined) {
      currentSkills.push({ level: availableLevel, subskill: ss })
    }
  }

  emit('update-subskills', currentSkills)
}

const resetSubskills = () => {
  emit('update-subskills', [])
}
</script>

<style scoped>
.text-left-override :deep(.flex-center) {
  justify-content: flex-start !important;
  padding-left: 20px !important;
}

.badge-col:nth-child(2) {
  z-index: 3;
}
.badge-col:nth-child(3) {
  z-index: 2;
}
.badge-col:nth-child(4) {
  z-index: 1;
}
</style>