<template>
  <v-btn
    variant="text"
    :class="['text-subtitle-1', userStore.isSupporter ? 'bg-strength' : 'bg-primary']"
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
          :rules="[(v: any) => (v || '').length <= maxNameLength || `Name must be ${maxNameLength} characters or less`]"
          :counter="maxNameLength"
          clearable
          rows="2"
          no-resize
          autofocus
          label="Enter your new name.."
          class="compact-control"
          @focus="highlightText"
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
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { useUserStore } from '@/stores/user-store'

export default {
  name: 'UserName',
  setup() {
    const userStore = useUserStore()
    const { highlightText } = useHighlightText()

    return { userStore, highlightText }
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
    }
  }
}
</script>
