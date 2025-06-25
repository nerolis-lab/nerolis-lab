<template>
  <v-container>
    <v-card class="frosted-glass">
      <v-tabs v-model="adminTab" class="frosted-glass-light">
        <v-tab value="users">Users</v-tab>
        <v-tab value="announcements">Announcements</v-tab>
        <v-tab value="changelog">Changelog</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="adminTab">
          <v-window-item value="users">
            <component :is="UserTable" />
          </v-window-item>

          <v-window-item value="announcements">
            <component :is="Announcements" />
          </v-window-item>

          <v-window-item value="changelog">
            <component :is="Changelog" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Announcements from '@/components/admin/news-editor/announcements.vue'
import Changelog from '@/components/admin/changelog/changelog.vue'
import UserTable from '@/components/admin/user-table/user-table.vue'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'AdminPage',
  components: {
    UserTable,
    Announcements,
    Changelog
  },
  setup() {
    const adminTab = ref('users')

    return {
      adminTab,
      UserTable,
      Announcements,
      Changelog
    }
  }
})
</script>
