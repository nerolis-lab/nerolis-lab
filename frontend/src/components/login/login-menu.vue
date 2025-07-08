<template>
  <v-dialog v-model="loginMenu" max-width="500px" aria-label="login menu">
    <template #activator="{ props }">
      <v-list-item v-if="!userStore.loggedIn">
        <v-card title="Login" class="text-center" rounded="xl" color="primary" v-bind="props" />
      </v-list-item>
      <v-list-item v-else id="logoutButton" prepend-icon="mdi-logout" @click="userStore.logout"> Log out </v-list-item>
    </template>

    <v-card v-if="!userStore.loggedIn" class="login-card">
      <div class="welcome-icon-container">
        <v-icon size="48" class="welcome-icon" color="night">mdi-sleep</v-icon>
      </div>
      <v-card-title class="text-center pt-0">Welcome!</v-card-title>

      <v-card-text>
        <p class="mb-4 text-center">
          Sign in to access your account. A new account will be created automatically if you don't have one yet.
        </p>

        <v-list>
          <v-list-item>
            <v-btn
              block
              title="Patreon"
              class="provider-btn patreon"
              rounded="xl"
              size="x-large"
              @click="handlePatreonLogin"
            >
              <template #prepend>
                <PatreonIcon />
              </template>
              Patreon
              <template #append>
                <v-icon class="external-link-icon" size="24">mdi-open-in-new</v-icon>
              </template>
            </v-btn>
          </v-list-item>

          <v-list-item>
            <v-btn
              block
              title="Google"
              class="provider-btn google"
              rounded="xl"
              size="x-large"
              @click="handleGoogleLogin"
            >
              <template #prepend>
                <GoogleIcon />
              </template>
              Google
              <template #append>
                <v-icon class="external-link-icon" size="24">mdi-open-in-new</v-icon>
              </template>
            </v-btn>
          </v-list-item>

          <v-list-item>
            <v-btn
              block
              title="Discord"
              class="provider-btn discord"
              rounded="xl"
              size="x-large"
              @click="handleDiscordLogin"
            >
              <template #prepend>
                <DiscordIcon />
              </template>
              Discord
              <template #append>
                <v-icon class="external-link-icon" size="24">mdi-open-in-new</v-icon>
              </template>
            </v-btn>
          </v-list-item>
        </v-list>

        <div class="mt-4 text-small text-center">
          You can link additional login providers in Account Settings after logging in.
        </div>

        <v-card class="supporter-hint mt-4" variant="flat" color="rgba(249, 104, 84, 0.1)" rounded="lg">
          <v-card-text>
            <v-icon color="supporter" size="20">mdi-heart</v-icon>
            <span>
              Supporting us on
              <a
                href="https://www.patreon.com/nerolislab"
                target="_blank"
                rel="noopener noreferrer"
                class="supporter-link"
                >Patreon</a
              >
              helps keep this site alive and free for everyone. Plus, you'll get a cool supporter badge and access to
              happy avatars!
            </span>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-list v-else>
      <v-list-item id="logoutButton" prepend-icon="mdi-logout" @click="userStore.logout"> Log out </v-list-item>
    </v-list>
  </v-dialog>
</template>

<script setup lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GoogleIcon from '@/components/icons/icon-google.vue'
import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { loginWithDiscord } from '@/services/login/discord-service'
import { loginWithGoogle } from '@/services/login/google-service'
import { loginWithPatreon } from '@/services/login/patreon-service'
import { useUserStore } from '@/stores/user-store'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const loginMenu = ref(false)
const userStore = useUserStore()
const route = useRoute()

const handleDiscordLogin = () => loginWithDiscord(route)
const handleGoogleLogin = () => loginWithGoogle(route)
const handlePatreonLogin = () => loginWithPatreon(route)
</script>

<style lang="scss">
.g-btn-wrapper {
  display: list-item !important;
}

.login-card {
  padding: 8px;
}

.provider-btn {
  display: flex;
  justify-content: space-between;
  text-transform: none;
  font-size: 20px;
  letter-spacing: 0.0125em;

  &.patreon {
    background-color: $patreon;
  }

  &.google {
    background-color: $google;
  }

  &.discord {
    background-color: $discord;
  }

  @media (max-width: 340px) {
    .external-link-icon {
      display: none;
    }
  }
}

.welcome-icon-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.welcome-icon {
  color: var(--v-primary-base);
  animation: float 3s ease-in-out infinite;
  will-change: transform;
}

.supporter-hint {
  font-size: 0.9rem;
  padding: 0;
}

/* Add style for the patreon link */
.supporter-link {
  color: inherit; /* Inherit color from parent span */
  text-decoration: underline;
  font-weight: bold;
}

.supporter-link:hover {
  text-decoration: none; /* Optional: remove underline on hover */
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
