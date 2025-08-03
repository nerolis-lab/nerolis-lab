<template>
  <v-btn
    variant="text"
    class="text-h6"
    :text="pokemonInstance?.name ?? 'Unknown'"
    :disabled="disabled || !pokemonInstance"
    @click="openEditDialog"
  >
    <template #append>
      <v-icon size="24">mdi-pencil</v-icon>
    </template>
  </v-btn>

  <v-dialog id="pokemonNameDialog" v-model="isEditDialogOpen" max-width="600px">
    <v-card title="Change Name">
      <v-card-text class="pt-4 pb-0">
        <v-text-field
          v-model="editedName"
          :rules="[
            (v: any) => (v || '').length <= maxNameLength || `Description must be ${maxNameLength} characters or less`
          ]"
          :counter="maxNameLength"
          clearable
          rows="2"
          no-resize
          label="Pokemon Name"
          class="compact-control"
          autofocus
          variant="outlined"
          @focus="highlightText"
          @keydown.enter="saveEditDialog"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn id="rerollButton" icon @click="editedName = randomizeName()">
          <v-icon>mdi-dice-multiple</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn id="cancelButton" @click="closeEditDialog">Cancel</v-btn>
        <v-btn id="saveButton" :disabled="remainingChars < 0" rounded="lg" color="primary" @click="saveEditDialog"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { randomName } from '@/services/utils/name-utils'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { computed, ref } from 'vue'

interface Props {
  pokemonInstance?: PokemonInstanceExt
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update-name': [name: string]
}>()

const { highlightText } = useHighlightText()

const isEditDialogOpen = ref(false)
const maxNameLength = 12
const editedName = ref('')

const remainingChars = computed(() => {
  return maxNameLength - (editedName.value?.length || 0)
})

const openEditDialog = () => {
  if (!props.pokemonInstance) return
  editedName.value = props.pokemonInstance.name
  isEditDialogOpen.value = true
}

const closeEditDialog = () => {
  isEditDialogOpen.value = false
}

const saveEditDialog = async () => {
  if (remainingChars.value >= 0) {
    if (remainingChars.value === maxNameLength && props.pokemonInstance) {
      editedName.value = props.pokemonInstance.name
    }
    emit('update-name', editedName.value)
    isEditDialogOpen.value = false
  }
}

const randomizeName = () => {
  if (!props.pokemonInstance) return ''
  return randomName(props.pokemonInstance.pokemon, 12, props.pokemonInstance.gender)
}
</script>
