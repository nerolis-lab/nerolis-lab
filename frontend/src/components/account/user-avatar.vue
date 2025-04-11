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

        <v-text-field
          v-model="searchQuery"
          autofocus
          label="Search"
          variant="outlined"
          dense
          class="mx-4 w-100"
          hide-details
          clearable
          @keydown.enter="selectFirstAvatar"
        ></v-text-field>
      </v-card-title>

      <v-container>
        <v-row dense>
          <v-col v-for="{ name, path } in filteredAvatars" :key="name" class="flex-center">
            <v-avatar
              color="secondary"
              class="cursor-pointer"
              @click="selectAvatar(name)"
              style="min-height: 80px; min-width: 80px"
            >
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
<script lang="ts">
import { userAvatar } from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { computed, ref } from 'vue'

export default {
  name: 'UserAvatar',
  emits: ['update-avatar'],

  setup(_, { emit }) {
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
        ({ name, path, displayName }) => !query || displayName.toLowerCase().includes(query)
      )
    })

    return {
      isEditDialogOpen,
      openEditDialog,
      closeEditDialog,
      selectAvatar,
      selectFirstAvatar,
      userAvatar,
      avatarStore,
      searchQuery,
      filteredAvatars,
      userStore
    }
  }
}
</script>
