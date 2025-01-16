<template>
  <v-btn
    variant="text"
    class="text-subtitle-1 bg-primary"
    :text="userStore.name"
    @click="openEditDialog"
    :disabled="!userStore.loggedIn"
  >
    <template #append v-if="userStore.loggedIn">
      <v-icon size="16">mdi-pencil</v-icon>
    </template>
  </v-btn>

  <v-dialog v-model="isEditDialogOpen" max-width="600px">
    <v-card title="Change Name">
      <v-card-text class="pt-4 pb-0">
        <v-textarea
          v-model="editedName"
          :rules="[
            (v: any) => (v || '').length <= maxNameLength || `Description must be ${maxNameLength} characters or less`
          ]"
          :counter="maxNameLength"
          clearable
          rows="2"
          no-resize
          label="Enter your new name.."
          class="compact-control"
          @input="filterInput"
          @keydown.enter="saveEditDialog"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn id="cancelButton" @click="closeEditDialog">Cancel</v-btn>
        <v-btn id="saveButton" :disabled="remainingChars < 0" rounded="lg" color="primary" @click="saveEditDialog"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user-store'

export default {
  name: 'UserName',
  setup() {
    const userStore = useUserStore()

    return { userStore }
  },
  emits: ['update-name'],
  data: () => ({
    isEditDialogOpen: false,
    maxNameLength: 15,
    editedName: ''
  }),
  computed: {
    remainingChars() {
      return this.maxNameLength - (this.editedName?.length || 0)
    }
  },
  methods: {
    openEditDialog() {
      this.editedName = this.userStore.name
      this.isEditDialogOpen = true
    },
    closeEditDialog() {
      this.isEditDialogOpen = false
    },
    async saveEditDialog() {
      if (this.remainingChars >= 0) {
        if (this.remainingChars === this.maxNameLength) {
          this.editedName = this.userStore.name
        }
        this.$emit('update-name', this.editedName)
        this.isEditDialogOpen = false
      }
    },
    filterInput(event: Event) {
      const input = event.target as HTMLInputElement
      const regex = /^[a-zA-Z0-9 ]*$/
      if (!regex.test(input.value)) {
        this.editedName = this.editedName.replace(/[^a-zA-Z0-9 ]/g, '')
      }
    }
  }
}
</script>
