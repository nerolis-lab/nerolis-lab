<template>
  <v-btn icon size="100" @click="openEditDialog">
    <v-badge icon="mdi-pencil" :color="userStore.roleData.color" offset-x="10" offset-y="10">
      <v-avatar size="100" color="secondary">
        <v-img :src="userAvatar()" height="100" width="100"></v-img>
      </v-avatar>
    </v-badge>
  </v-btn>

  <v-dialog v-model="isEditDialogOpen" max-width="600px" height="75dvh">
    <v-card>
      <v-card-title class="flex-center flex-column">
        <span class="text-h6 mb-4">Select an Avatar</span>

        <CustomSearchBar v-model="searchQuery" @keydown.enter="selectFirstAvatar" />
      </v-card-title>

      <v-container>
        <v-row dense>
          <v-col v-for="{ name, path } in filteredAvatars" :key="name" class="flex-center">
            <v-avatar color="secondary" class="cursor-pointer" @click="selectAvatar(name)" :size="80" rounded="lg">
              <v-img :src="`/images/avatar/${path}`"></v-img>
            </v-avatar>
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="closeEditDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { userAvatar } from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { computed, ref } from 'vue'

const emit = defineEmits<{
  'update-avatar': [avatar: string]
}>()

const userStore = useUserStore()
const avatarStore = useAvatarStore()
const isEditDialogOpen = ref(false)
const searchQuery = ref('')

const openEditDialog = () => {
  isEditDialogOpen.value = true
}

const closeEditDialog = () => {
  isEditDialogOpen.value = false
}

const selectAvatar = (avatar: string) => {
  emit('update-avatar', avatar)
  isEditDialogOpen.value = false
}

const selectFirstAvatar = () => {
  const firstAvatar = filteredAvatars.value[0]
  if (firstAvatar) {
    selectAvatar(firstAvatar.name)
  }
}

const filteredAvatars = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return avatarStore.getBasePokemonAvatars.filter(
    ({ displayName }) => !query || displayName.toLowerCase().includes(query)
  )
})
</script>
