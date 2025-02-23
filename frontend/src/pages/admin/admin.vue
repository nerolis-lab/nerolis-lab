<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h6">User Management Console</v-card-title>
      <v-card-text>
        <v-data-table
          v-if="!loading"
          key="key"
          :items="filteredUsers"
          :headers="headers"
          item-value="external_id"
          class="elevation-1"
          show-expand
          :loading="loading"
        >
          <template #top>
            <v-toolbar flat>
              <v-text-field
                v-model="search"
                label="Search users..."
                clearable
                prepend-inner-icon="mdi-magnify"
                hide-details
              ></v-text-field>
              <v-btn icon @click="refreshUsers">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-toolbar>
          </template>

          <template #[`item.avatar`]="{ item }">
            <v-avatar size="36">
              <v-img :src="avatarStore.getAvatarPath(item.avatar ?? 'default')" />
            </v-avatar>
          </template>

          <template #[`item.last_login`]="{ item }">
            <span>{{ DateUtils.formatDate(item.last_login ?? new Date().toISOString()) }}</span>
          </template>

          <template #[`item.created_at`]="{ item }">
            <span>{{ DateUtils.formatDate(item.created_at ?? new Date().toISOString()) }}</span>
          </template>

          <template #no-data>
            <v-alert type="error">No users found.</v-alert>
          </template>
        </v-data-table>

        <v-skeleton-loader v-else :loading="loading" type="table"></v-skeleton-loader>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { AdminService } from '@/services/admin/admin-service'
import { DateUtils } from '@/services/utils/date/date-utils'
import { userAvatar } from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import type { User } from 'sleepapi-common'
import { computed, defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'AdminConsole',
  setup() {
    const avatarStore = useAvatarStore()
    const users = ref<User[]>([])
    const loading = ref(false)
    const search = ref('')

    // Table headers
    const headers = ref<DataTableHeader[]>([
      { title: 'Avatar', key: 'avatar' },
      { title: 'Name', key: 'name' },
      { title: 'Friend Code', key: 'friend_code' },
      { title: 'Last Login', key: 'last_login', align: 'end' as 'end' },
      { title: 'Created At', key: 'created_at', align: 'end' as 'end' },
      { title: 'Role', key: 'role' },
      { title: 'External ID', key: 'external_id' }
    ])

    // Fetch users from backend
    const fetchUsers = async () => {
      loading.value = true
      try {
        users.value = (await AdminService.getUsers()).users
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        loading.value = false
      }
    }

    // Refresh users manually
    const refreshUsers = async () => {
      await fetchUsers()
    }

    const filteredUsers = computed(() => {
      if (!search.value) return users.value
      return users.value.filter((user) =>
        Object.values(user).join(' ').toLowerCase().includes(search.value.toLowerCase())
      )
    })

    // Fetch users on mount
    onMounted(fetchUsers)

    return {
      users,
      loading,
      headers,
      refreshUsers,
      userAvatar,
      search,
      filteredUsers,
      avatarStore,
      DateUtils
    }
  }
})
</script>
