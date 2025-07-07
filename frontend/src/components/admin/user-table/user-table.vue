<template>
  <v-card-title class="text-h6">User Management Console</v-card-title>
  <v-card-text>
    <v-data-table
      v-if="!loading"
      key="key"
      v-model:expanded="expanded"
      :items="filteredUsers"
      :headers="headers"
      item-value="external_id"
      class="elevation-1"
      show-expand
      :loading="loading"
    >
      <template #top>
        <v-toolbar flat>
          <CustomSearchBar v-model="search" />
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

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <user-admin-options :user="item" :save-function="saveFriendCode"></user-admin-options>
          </td>
        </tr>
      </template>

      <template #no-data>
        <v-alert type="error">No users found.</v-alert>
      </template>
    </v-data-table>

    <v-skeleton-loader v-else :loading="loading" type="table"></v-skeleton-loader>
  </v-card-text>
  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
    {{ snackbarText }}
  </v-snackbar>
</template>

<script lang="ts">
import UserAdminOptions from '@/components/admin/user-table/UserAdminOptions.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { AdminService } from '@/services/admin/admin-service'
import { UserService } from '@/services/user/user-service'
import { DateUtils } from '@/services/utils/date/date-utils'
import { userAvatar } from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import type { User } from 'sleepapi-common'
import { computed, defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'UserTable',
  components: {
    UserAdminOptions,
    CustomSearchBar
  },
  setup() {
    const avatarStore = useAvatarStore()
    const users = ref<User[]>([])
    const loading = ref(false)
    const search = ref('')
    const expanded = ref<string[]>([])

    const snackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

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

    const saveFriendCode = async (user: User) => {
      try {
        await UserService.updateUser({
          external_id: user.external_id,
          friend_code: user.friend_code
        })

        await fetchUsers()

        snackbarText.value = 'Friend code updated successfully'
        snackbarColor.value = 'success'
        snackbar.value = true
      } catch (error) {
        snackbarText.value = 'Failed to update friend code'
        snackbarColor.value = 'error'
        snackbar.value = true
        console.error('Failed to update friend code:', error)
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
      DateUtils,
      saveFriendCode,
      snackbar,
      snackbarText,
      snackbarColor,
      expanded
    }
  }
})
</script>
