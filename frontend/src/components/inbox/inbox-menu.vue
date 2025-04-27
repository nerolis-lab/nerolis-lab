<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :location="isMobile ? 'bottom center' : 'bottom'"
    :width="isMobile ? '85dvw' : '300px'"
    max-width="500px"
  >
    <template #activator="{ props }">
      <v-badge
        v-if="notifications.length > 0"
        color="primary"
        :content="notifications.length"
        offset-x="10"
        offset-y="10"
      >
        <v-btn v-bind="props" size="48" id="navBarIcon" icon>
          <v-icon size="32">mdi-inbox-full</v-icon>
        </v-btn>
      </v-badge>

      <v-btn v-else v-bind="props" size="48" id="emptyInbox" icon>
        <v-icon size="32">mdi-inbox</v-icon>
      </v-btn>
    </template>

    <v-card id="inboxMenu" class="inbox-menu" title="Inbox">
      <template #prepend>
        <v-avatar size="48" color="background">
          <v-icon size="32">mdi-inbox-outline</v-icon>
        </v-avatar>
      </template>

      <v-divider />

      <v-list>
        <v-list-item v-if="notifications.length" v-for="(notification, index) in notifications" :key="index">
          <component :is="getNotificationComponent(notification.template)" :notification="notification" />
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-title>No notifications</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import FriendRequestNotification from '@/components/inbox/notifications/friend-request-notification.vue'
import NewsNotification from '@/components/inbox/notifications/news/news-notification.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { defineComponent, type Component } from 'vue'
export const notificationComponentMap: Record<string, Component> = {
  FriendRequest: FriendRequestNotification,
  News: NewsNotification
}

export default defineComponent({
  name: 'InboxMenu',
  setup() {
    const notificationStore = useNotificationStore()
    const { isMobile } = useBreakpoint()

    return { notificationStore, isMobile }
  },
  data: () => ({
    menu: false
  }),
  async mounted() {
    await this.notificationStore.sync()
  },
  methods: {
    toggleMenu() {
      this.menu = !this.menu
    },
    getNotificationComponent(template: string) {
      return notificationComponentMap[template]
    }
  },
  computed: {
    notifications() {
      return this.notificationStore.notifications
    }
  }
})
</script>

<style scoped>
.inbox-menu {
  max-height: 50dvh;

  @media (max-width: 600px) {
    max-height: 80dvh;
  }
}
</style>
