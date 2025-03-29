import router from '@/router/router'
import { AuthService } from '@/services/login/auth-service'
import { DISCORD_REDIRECT_URI } from '@/services/login/discord-service'
import { UserService } from '@/services/user/user-service'
import { clearCacheAndLogout } from '@/stores/store-service'
import { defineStore } from 'pinia'
import {
  AuthProvider,
  ISLANDS,
  MAX_POT_SIZE,
  Roles,
  type AuthProviders,
  type IslandShortName,
  type LoginResponse,
  type Tokens,
  type UserSettingsResponse
} from 'sleepapi-common'
import { googleLogout } from 'vue3-google-login'

// TODO: we'll probably need to track tokens both all providers in case:
// 1. user signs up with google
// 2. user links discord
// 3. user unlinks google
// 4. ????
// 5. rip google tokens (need to fallback to discord)
// TODO: we can probably prioritize google tokens if they exist, fallback to discord

export interface UserState {
  name: string
  avatar: string | null
  externalId: string | null
  friendCode: string | null
  auth: AuthProviders | null
  role: Roles
  areaBonus: Record<IslandShortName, number>
  potSize: number
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      name: 'Guest',
      avatar: null,
      externalId: null,
      friendCode: null,
      role: Roles.Default,
      areaBonus: Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<IslandShortName, number>,
      potSize: MAX_POT_SIZE,
      auth: null
    }
  },
  getters: {
    loggedIn: (state) => state.auth != null,
    islandBonus: (state) => (shortName: IslandShortName) => 1 + state.areaBonus[shortName] / 100,
    isAdmin: (state) => state.role === Roles.Admin,
    isSupporter: (state) => state.role === Roles.Supporter,
    isAdminOrSupporter: (state) => state.role === Roles.Admin || state.role === Roles.Supporter,
    roleData: (state) => {
      return {
        color: state.role === Roles.Admin ? 'primary' : state.role === Roles.Supporter ? 'supporter' : 'surface',
        icon: state.role === Roles.Admin ? 'mdi-crown' : state.role === Roles.Supporter ? 'mdi-heart' : '',
        text: state.role === Roles.Admin ? 'Admin' : state.role === Roles.Supporter ? 'Supporter' : ''
      }
    },
    numberOfLinkedProviders: (state) => {
      return state.auth?.linkedProviders ? Object.keys(state.auth.linkedProviders).length : 0
    },
    isDiscordLinked: (state) => {
      return state.auth?.linkedProviders?.discord?.linked
    },
    isGoogleLinked: (state) => {
      return state.auth?.linkedProviders?.google?.linked
    }
  },
  actions: {
    migrate() {
      if (!this.role) {
        this.role = Roles.Default
      }

      if (!this.areaBonus) {
        this.areaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<
          IslandShortName,
          number
        >
      }

      if (!this.potSize) {
        this.potSize = MAX_POT_SIZE
      }

      const identifier = localStorage.getItem('email')
      const tokensObject = localStorage.getItem('tokens')
      // user is logged in with google
      if (!this.auth && identifier && tokensObject) {
        const tokens = JSON.parse(tokensObject) as Tokens
        this.auth = {
          activeProvider: AuthProvider.Google,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiryDate: tokens.expiryDate
          },
          linkedProviders: {
            google: {
              linked: true,
              identifier
            },
            discord: {
              linked: false
            }
          }
        }

        delete localStorage.identifier
        delete localStorage.email
        delete localStorage.tokens
      }
    },
    setInitialLoginData(serverData: LoginResponse) {
      this.name = serverData.name
      this.avatar = serverData.avatar ?? 'default'
      this.externalId = serverData.externalId
      this.role = serverData.role
      this.friendCode = serverData.friendCode
      this.auth = serverData.auth
    },
    setUserSettings(userSettings: UserSettingsResponse) {
      this.name = userSettings.name
      this.avatar = userSettings.avatar
      this.role = userSettings.role
      this.potSize = userSettings.potSize

      for (const [area, bonus] of Object.entries(userSettings.areaBonuses)) {
        this.areaBonus[area as IslandShortName] = bonus
      }
    },
    async syncUserSettings() {
      const userSettings = await UserService.getUserSettings()
      this.setUserSettings(userSettings)
    },
    async login(authCode: string, provider: AuthProvider, redirectUri?: string) {
      const loginResponse = await AuthService.login(authCode, provider, redirectUri)

      this.setInitialLoginData(loginResponse)

      router.push('/')
    },
    async unlinkProvider(provider: AuthProvider) {
      await AuthService.unlinkProvider(provider)
      this.logout() // will wipe cache and logout
    },
    async refresh() {
      try {
        if (this.auth) {
          const { tokens, activeProvider } = this.auth
          if (Date.now() > tokens.expiryDate) {
            const { refreshToken } = tokens
            const redirectUri = activeProvider === AuthProvider.Discord ? DISCORD_REDIRECT_URI : undefined

            const { access_token, expiry_date } = await AuthService.refresh(refreshToken, activeProvider, redirectUri)
            this.auth.tokens = {
              accessToken: access_token,
              refreshToken,
              expiryDate: expiry_date
            }
          }
        } else {
          this.logout()
        }
      } catch {
        this.logout()
      }
    },
    logout() {
      if (this.auth?.activeProvider === AuthProvider.Google) {
        googleLogout()
      }
      clearCacheAndLogout()
      router.push('/')
    }
  },
  persist: true
})
