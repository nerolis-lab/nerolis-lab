<template>
  <div class="flex-center pa-4">
    <h1>Logging in with Discord...</h1>
    <v-progress-circular indeterminate color="primary" size="64" />
  </div>
</template>

<script lang="ts">
import { DISCORD_REDIRECT_URI } from '@/services/login/discord-service'
import { useUserStore } from '@/stores/user-store'
import { AuthProvider } from 'sleepapi-common'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'DiscordPage',
  props: {
    originalRoute: {
      type: String,
      required: true
    }
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    return { router, userStore }
  },
  async mounted() {
    try {
      // Get the code from URL
      const code = this.$route.query.code as string
      const error = this.$route.query.error as string

      if (error) {
        logger.error(`Discord authentication error: ${error}`)
        this.router.push('/')
        return
      }

      if (!code) {
        logger.error('No Discord authorization code provided')
        this.router.push('/')
        return
      }

      await this.userStore.login({
        authCode: code,
        provider: AuthProvider.Discord,
        originalRoute: this.originalRoute,
        redirectUri: DISCORD_REDIRECT_URI
      })
    } catch (error) {
      logger.error(`Discord login failed: ${error instanceof Error ? error.message : String(error)}`)
      this.userStore.logout()
      this.router.push('/')
    }
  }
})
</script>
