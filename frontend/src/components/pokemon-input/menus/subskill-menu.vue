<template>
  <v-card class="pa-4">
    <SubskillGrid
      :current-subskills="selectedSubskills"
      :available-subskills="availableSubskills"
      @update-subskills="handleSubskillUpdate"
    />

    <v-row dense class="mt-3">
      <v-col cols="4">
        <v-btn class="w-100" size="large" rounded="lg" color="secondary" data-testid="cancel-button" @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-btn class="w-100" size="large" rounded="lg" color="surface" data-testid="clear-button" @click="clear"
          >Clear</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-btn
          class="w-100"
          size="large"
          rounded="lg"
          color="primary"
          data-testid="save-button"
          @click="updateSubskills"
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import SubskillGrid from '@/components/pokemon-input/menus/subskill-grid.vue'
import { type Subskill, type SubskillInstanceExt } from 'sleepapi-common'
import { ref } from 'vue'

const props = defineProps<{
  currentSubskills: SubskillInstanceExt[]
  availableSubskills: any
}>()
const emit = defineEmits<{
  cancel: []
  'update-subskills': [subskills: SubskillInstanceExt[]]
}>()

const selectedSubskills = ref<SubskillInstanceExt[]>(JSON.parse(JSON.stringify(props.currentSubskills)))

const handleSubskillUpdate = (updatedSubskills: SubskillInstanceExt[]) => {
  selectedSubskills.value = updatedSubskills
}

const cancel = () => {
  emit('cancel')
}

const clear = () => {
  selectedSubskills.value = []
}

const updateSubskills = () => {
  emit('update-subskills', selectedSubskills.value)
}
</script>

<style scoped>
</style>
