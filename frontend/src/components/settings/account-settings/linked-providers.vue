<template>
  <v-card class="frosted-glass" rounded="lg">
    <v-card-title class="pb-2">
      <v-icon icon="mdi-link-variant" class="mr-2" color="strength" />
      Linked Accounts
    </v-card-title>

    <v-card-text class="pt-0">
      <div v-for="provider in providers" :key="provider.id" class="provider-item">
        <div class="provider-info">
          <v-avatar size="32" class="mr-4">
            <component :is="provider.icon" :color="provider.color" />
          </v-avatar>
          <span>{{ provider.name }}</span>
        </div>
        <v-btn
          width="100px"
          :color="userStore.isProviderLinked(provider.id) ? 'error-3' : 'secondary'"
          :variant="userStore.isProviderLinked(provider.id) ? 'outlined' : 'elevated'"
          class="provider-action-btn"
          :disabled="userStore.isProviderLinked(provider.id) && userStore.numberOfLinkedProviders <= 1"
          @click="
            userStore.isProviderLinked(provider.id)
              ? confirmUnlinkProvider(provider.id as AuthProvider)
              : provider.linkMethod()
          "
        >
          {{ userStore.isProviderLinked(provider.id) ? 'UNLINK' : 'LINK' }}
        </v-btn>
      </div>

      <div v-if="userStore.numberOfLinkedProviders <= 1" class="help-text">
        <v-icon icon="mdi-information-outline" size="small" color="warning" class="mr-1" />
        You can't unlink your last provider. To delete your account entirely, use the button below.
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="unlinkDialog" max-width="450" class="unlink-dialog">
    <v-card>
      <v-card-title class="border-b-sm pb-4">
        <v-icon icon="mdi-link-off" class="mr-2" color="error" />
        Unlink Account
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          Are you sure you want to unlink your <strong>{{ getProviderName(providerToUnlink) }}</strong> account?
        </p>

        <v-alert v-if="unlinkingActiveProvider()" type="warning" variant="tonal" density="compact" class="mt-3">
          <p class="mb-0">Unlinking this provider will log you out.</p>
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="tonal" @click="unlinkDialog = false"> Cancel </v-btn>
        <v-btn color="error" @click="unlinkProvider"> Unlink </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GoogleIcon from '@/components/icons/icon-google.vue'
import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { success } from '@/components/snackbar/snackbar.vue'
import { loginWithDiscord } from '@/services/login/discord-service'
import { loginWithGoogle } from '@/services/login/google-service'
import { loginWithPatreon } from '@/services/login/patreon-service'
import { useUserStore } from '@/stores/user-store'
import { AuthProvider } from 'sleepapi-common'
import { defineComponent, type DefineComponent, markRaw } from 'vue'
import { useRoute } from 'vue-router'

export interface ProviderStyle {
  id: AuthProvider
  name: string
  icon: DefineComponent
  color?: string
  linkMethod: () => void
}

export default defineComponent({
  name: 'LinkedProviders',
  components: {
    DiscordIcon,
    GoogleIcon,
    PatreonIcon
  },
  setup() {
    const route = useRoute()
    const userStore = useUserStore()

    return {
      userStore,
      handleDiscordLogin: () => loginWithDiscord(route),
      handleGoogleLogin: () => loginWithGoogle(route),
      handlePatreonLogin: () => loginWithPatreon(route)
    }
  },
  data() {
    return {
      unlinkDialog: false,
      providerToUnlink: null as AuthProvider | null,
      providers: [
        {
          id: AuthProvider.Google,
          name: 'Google',
          icon: markRaw(GoogleIcon),
          linkMethod: this.handleGoogleLogin
        },
        {
          id: AuthProvider.Discord,
          name: 'Discord',
          icon: markRaw(DiscordIcon),
          color: '#5865F2',
          linkMethod: this.handleDiscordLogin
        },
        {
          id: AuthProvider.Patreon,
          name: 'Patreon',
          icon: markRaw(PatreonIcon),
          color: '#F96854',
          linkMethod: this.handlePatreonLogin
        }
      ] as ProviderStyle[]
    }
  },
  methods: {
    getProviderName(provider: AuthProvider | null): string {
      const found = this.providers.find((p) => p.id === provider)
      return found ? found.name : ''
    },
    confirmUnlinkProvider(provider: AuthProvider) {
      this.providerToUnlink = provider
      this.unlinkDialog = true
    },
    async unlinkProvider() {
      if (this.providerToUnlink) {
        try {
          await this.userStore.unlinkProvider(this.providerToUnlink)
          success(`${this.getProviderName(this.providerToUnlink)} account unlinked successfully!`)
        } catch (error) {
          console.error(`Error unlinking ${this.getProviderName(this.providerToUnlink)} account:`, error)
        }
        this.unlinkDialog = false
        this.providerToUnlink = null
      }
    },
    unlinkingActiveProvider() {
      return this.providerToUnlink === this.userStore.auth?.activeProvider
    }
  }
})
</script>

<style lang="scss" scoped>
.provider-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.provider-item:last-child {
  border-bottom: none;
}

.provider-info {
  display: flex;
  align-items: center;
}

.help-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
  display: flex;
  align-items: center;
}

.dialog-title {
  background: rgba(30, 30, 46, 0.9);
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
