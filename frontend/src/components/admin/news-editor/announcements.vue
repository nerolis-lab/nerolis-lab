<template>
  <v-container>
    <v-card>
      <v-card-title class="text-white py-3"> Announcements </v-card-title>

      <v-tabs v-model="announcementTab">
        <v-tab value="create">
          <v-icon start>mdi-pencil</v-icon>
          Create New
        </v-tab>
        <v-tab value="history" @click="loadNewsHistory">
          <v-icon start>mdi-history</v-icon>
          History
        </v-tab>
      </v-tabs>

      <v-card-text class="pt-4">
        <v-window v-model="announcementTab">
          <v-window-item value="create">
            <v-form @submit.prevent="publishNews" ref="form">
              <v-text-field
                v-model="title"
                label="Title"
                :rules="titleRules"
                required
                variant="outlined"
                class="mt-2"
                dirty
                validate-on="blur"
              ></v-text-field>

              <v-text-field
                v-model="content"
                label="Body"
                :rules="contentRules"
                required
                class="mt-2"
                variant="outlined"
                dirty
                validate-on="blur"
              ></v-text-field>

              <div class="d-flex flex-column align-left mt-2" style="width: 300px">
                <p class="text-subtitle-1 mb-3">Preview</p>
                <div>
                  <NewsNotificationComponent
                    :key="previewKey"
                    :notification="previewNotification"
                    :preview-mode="true"
                  />
                </div>
              </div>

              <v-card-actions class="pt-6 flex-right">
                <v-btn @click="reset" variant="text"> Reset </v-btn>
                <v-btn @click="publishNews" color="primary" :loading="isPublishing" :disabled="!isValid">
                  Publish
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-window-item>

          <!-- History tab -->
          <v-window-item value="history">
            <v-data-table :headers="historyHeaders" :items="newsHistory" :loading="isLoading" class="elevation-1">
              <template v-slot:item.created_at="{ item }">
                {{ DateUtils.formatDate(item.created_at ?? new Date().toISOString()) }}
              </template>

              <template v-slot:item.author="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="24" class="mr-2" v-if="item.authorAvatar">
                    <v-img :src="getAvatarPath(item.authorAvatar)"></v-img>
                  </v-avatar>
                  {{ item.author }}
                </div>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon size="small" @click="viewNewsDetails(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="pa-4 text-center">
                  <p>No announcements have been published yet.</p>
                </div>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>

        <v-dialog v-model="detailDialog" max-width="500px">
          <v-card v-if="selectedNews" class="pa-4">
            <v-card-title>Announcement Preview</v-card-title>
            <v-card-text class="d-flex justify-center">
              <div style="width: 300px; max-width: 100%">
                <NewsNotificationComponent :notification="selectedNewsNotification" :preview-mode="true" />
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="detailDialog = false"> Close </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="5000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import NewsNotificationComponent from '@/components/inbox/notifications/news/news-notification.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { NotificationService } from '@/services/notification-service/notification-service'
import { DateUtils } from '@/services/utils/date/date-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import {
  NotificationType,
  type NewsNotification,
  type NewsNotificationRequest,
  type UserNotification
} from 'sleepapi-common'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'Announcements',
  components: {
    NewsNotificationComponent
  },
  setup() {
    const userStore = useUserStore()
    const avatarStore = useAvatarStore()
    const { isMobile } = useBreakpoint()
    const authorExternalId = userStore.externalId ?? ''

    const announcementTab = ref('create')

    // Separate refs for form fields to improve reactivity
    const title = ref('')
    const content = ref('')
    const previewKey = ref(0) // Key to force re-render

    // Watch changes to form fields
    watch([title, content], () => {
      previewKey.value++ // Increment to force re-render
    })

    // Create section data
    const form = ref<any>(null)
    const isPublishing = ref<boolean>(false)

    // History section data
    const newsHistory = ref<NewsNotification[]>([])
    const isLoading = ref<boolean>(false)
    const detailDialog = ref<boolean>(false)
    const selectedNews = ref<NewsNotification | null>(null)

    // Shared data
    const showSnackbar = ref<boolean>(false)
    const snackbarText = ref<string>('')
    const snackbarColor = ref<string>('success')

    // Validation rules
    const titleRules = [
      (v: string) => !!v || 'Title is required',
      (v: string) => v.length <= 255 || 'Title must be less than 255 characters'
    ]

    const contentRules = [
      (v: string) => !!v || 'Content is required',
      (v: string) => v.length >= 10 || 'Content should be at least 10 characters'
    ]

    // Table headers with proper typing
    const historyHeaders = ref<DataTableHeader[]>([
      { title: 'Author', key: 'author', sortable: true },
      { title: 'Published', key: 'created_at', sortable: true },
      { title: 'Title', key: 'title', sortable: true },
      { title: 'Content', key: 'content', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
    ])

    const isValid = computed((): boolean => {
      return title.value.length > 0 && title.value.length <= 255 && content.value.length >= 10
    })

    // Computed for the NewsNotificationRequest
    const newNewsPost = computed<NewsNotificationRequest>(() => ({
      title: title.value,
      content: content.value,
      authorExternalId
    }))

    // Methods
    const reset = (): void => {
      title.value = ''
      content.value = ''
      if (form.value) {
        form.value.resetValidation()
      }
    }

    const publishNews = async (): Promise<void> => {
      if (!isValid.value) return

      try {
        isPublishing.value = true

        await NotificationService.createNews(newNewsPost.value)

        snackbarText.value = 'Announcement published successfully'
        snackbarColor.value = 'success'
        showSnackbar.value = true

        // Reset the form after successful publish
        reset()
      } catch (error: any) {
        snackbarText.value = `Error publishing announcement: ${error?.message || 'Unknown error'}`
        snackbarColor.value = 'error'
        showSnackbar.value = true
      } finally {
        isPublishing.value = false
      }
    }

    const loadNewsHistory = async (): Promise<void> => {
      // Only load if not already loaded or if we need to refresh
      if (newsHistory.value.length === 0 || announcementTab.value === 'history') {
        try {
          isLoading.value = true
          const news = await NotificationService.getNewsHistory()
          newsHistory.value = news
        } catch (error: any) {
          snackbarText.value = `Error loading announcements: ${error?.message || 'Unknown error'}`
          snackbarColor.value = 'error'
          showSnackbar.value = true
        } finally {
          isLoading.value = false
        }
      }
    }

    const viewNewsDetails = (news: NewsNotification, event?: Event): void => {
      if (event) {
        event.stopPropagation()
      }
      selectedNews.value = news
      detailDialog.value = true
    }

    // Create a mock notification for preview
    const previewNotification = computed<UserNotification>(() => {
      return {
        id: 0,
        externalId: 'preview',
        sender: {
          externalId: authorExternalId,
          name: userStore.name,
          avatar: userStore.avatar ?? 'default',
          friend_code: userStore.friendCode ?? '0000'
        },
        receiver: {
          externalId: '',
          name: 'Random user',
          avatar: 'default',
          friend_code: '0000'
        },
        template: NotificationType.News,
        created_at: new Date(),
        news: {
          title: title.value || 'Your announcement title',
          content: content.value || 'Your announcement content',
          author: userStore.name || 'You',
          authorAvatar: userStore.avatar || 'default',
          created_at: new Date().toISOString()
        }
      }
    })

    const selectedNewsNotification = computed<UserNotification>(() => {
      if (!selectedNews.value) {
        return previewNotification.value // Fallback
      }

      return {
        id: 0,
        externalId: 'history-preview',
        sender: {
          externalId: 'admin',
          name: selectedNews.value.author,
          avatar: selectedNews.value.authorAvatar ?? 'default',
          friend_code: '0000'
        },
        receiver: {
          externalId: '',
          name: 'Random user',
          avatar: 'default',
          friend_code: '0000'
        },
        template: NotificationType.News,
        created_at: selectedNews.value.created_at ? new Date(selectedNews.value.created_at) : new Date(),
        news: {
          title: selectedNews.value.title,
          content: selectedNews.value.content,
          author: selectedNews.value.author,
          authorAvatar: selectedNews.value.authorAvatar,
          created_at: selectedNews.value.created_at
        }
      }
    })

    return {
      previewNotification,
      previewKey, // Return the key for forcing re-render
      announcementTab,

      // Return direct refs for form fields
      title,
      content,

      // Create section
      form,
      newNewsPost,
      titleRules,
      contentRules,
      isPublishing,
      isValid,

      // History section
      newsHistory,
      isLoading,
      historyHeaders,
      detailDialog,
      selectedNews,
      getAvatarPath: avatarStore.getAvatarPath,
      selectedNewsNotification,

      // Shared
      showSnackbar,
      snackbarText,
      snackbarColor,

      // Methods
      reset,
      publishNews,
      loadNewsHistory,
      viewNewsDetails,
      DateUtils,
      isMobile
    }
  }
})
</script>

<style scoped>
.white-space-pre-wrap {
  white-space: pre-wrap;
}
</style>
