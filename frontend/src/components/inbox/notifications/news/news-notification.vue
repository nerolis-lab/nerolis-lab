<template>
  <v-card
    :title="news?.title"
    :subtitle="DateUtils.formatDate(news?.created_at ?? new Date().toISOString())"
    color="background"
    :loading="loading"
    class="w-100"
    density="compact"
    style="opacity: 90%"
  >
    <template #prepend>
      <v-avatar size="36" color="surface">
        <v-img :src="avatarImage" />
      </v-avatar>
    </template>

    <template #text>
      <v-row dense>
        <v-col class="d-flex flex-column">
          <span>{{ news?.content }}</span>

          <span class="mt-4">- {{ author }}</span>
        </v-col>
      </v-row>
    </template>

    <v-card-actions>
      <v-btn variant="text" color="accent" @click="dismiss()">Dismiss</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
// TODO: currently timestamp isnt shown in user's local time
import { NotificationService } from '@/services/notification-service/notification-service'
import { DateUtils } from '@/services/utils/date/date-utils'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import type { UserNotification } from 'sleepapi-common'
import { defineComponent, ref, type PropType } from 'vue'

export default defineComponent({
  name: 'NewsNotification',
  props: {
    notification: {
      type: Object as PropType<UserNotification>,
      required: true
    },
    previewMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { notification, previewMode } = props
    const { news } = notification
    if (!news) {
      logger.error('Notification does not have news, cant display, contact developer')
    }

    const notificationStore = useNotificationStore()
    const loading = ref(false)

    const avatarImage = '/images/sneasel/snote.png'
    const author = "Neroli's Assistant"

    const dismiss = async (): Promise<void> => {
      if (previewMode) {
        return
      }

      loading.value = true
      if (!notification.externalId) {
        logger.error('Notification does not have an externalIdl, cant dismiss, contact developer')
        loading.value = false
        return
      }
      const success = await NotificationService.dismissNotification(notification.externalId)

      if (success) {
        await notificationStore.sync()
      }

      loading.value = false
    }

    return { news, avatarImage, author, DateUtils, loading, dismiss }
  }
})
</script>
