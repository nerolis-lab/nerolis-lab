import router from '@/router/router'
import { AuthService } from '@/services/login/auth-service'
import { DISCORD_REDIRECT_URI } from '@/services/login/discord-service'
import { UserService } from '@/services/user/user-service'
import { clearCacheAndLogout } from '@/stores/store-service'
import { useTeamStore } from '@/stores/team/team-store'
import { defineStore } from 'pinia'
import {
  AuthProvider,
  EXPERT_ISLANDS,
  ISLANDS,
  MAX_POT_SIZE,
  Roles,
  type AreaInstances,
  type AuthProviders,
  type IslandInstance,
  type IslandShortName,
  type LoginResponse,
  type UserSettingsResponse
} from 'sleepapi-common'

export interface UserState {
  name: string
  avatar: string | null
  externalId: string | null
  friendCode: string | null
  auth: AuthProviders | null
  role: Roles // TODO: make Role[]
  islands: AreaInstances
  potSize: number
  supporterSince: string | null
  randomizeNicknames: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const allIslands = [...ISLANDS, ...EXPERT_ISLANDS]
    const islandsRecord = Object.fromEntries(
      allIslands.map((island) => [island.shortName, { ...island, areaBonus: 0 }])
    ) as Record<IslandShortName, IslandInstance>

    return {
      name: 'Guest',
      avatar: null,
      externalId: null,
      friendCode: null,
      role: Roles.Default,
      islands: islandsRecord,
      potSize: MAX_POT_SIZE,
      auth: null,
      supporterSince: null,
      randomizeNicknames: true
    }
  },
  getters: {
    // auth
    loggedIn: (state) => state.auth != null,
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
      return state.auth?.linkedProviders
        ? Object.values(state.auth.linkedProviders).filter((provider) => provider.linked).length
        : 0
    },
    isProviderLinked: (state) => (provider: AuthProvider) => {
      return state.auth?.linkedProviders?.[provider]?.linked === true
    },

    // areas
    islandBonus: (state) => (shortName?: IslandShortName) => {
      const bonus = shortName ? state.islands[shortName].areaBonus : 0
      return 1 + bonus / 100
    },
    baseIslands: (state) => Object.values(state.islands).filter((island) => !island.expert),
    expertIslands: (state) => Object.values(state.islands).filter((island) => island.expert)
  },
  actions: {
    setInitialLoginData(serverData: LoginResponse) {
      this.name = serverData.name
      this.avatar = serverData.avatar ?? 'default'
      this.externalId = serverData.externalId
      this.role = serverData.role
      this.friendCode = serverData.friendCode

      if (this.auth) {
        this.auth = {
          ...this.auth,
          linkedProviders: serverData.auth.linkedProviders
        }
      } else {
        this.auth = serverData.auth
      }
    },
    setUserSettings(userSettings: UserSettingsResponse) {
      this.name = userSettings.name
      this.avatar = userSettings.avatar
      this.role = userSettings.role
      this.potSize = userSettings.potSize
      this.randomizeNicknames = userSettings.randomizeNicknames

      for (const [area, bonus] of Object.entries(userSettings.areaBonuses)) {
        this.islands[area as IslandShortName].areaBonus = bonus
      }

      this.supporterSince = userSettings.supporterSince
    },
    async syncUserSettings() {
      if (this.loggedIn) {
        const userSettings = await UserService.getUserSettings()
        this.setUserSettings(userSettings)
      }
    },
    async login(params: { authCode: string; provider: AuthProvider; originalRoute: string; redirectUri?: string }) {
      const { authCode, provider, originalRoute, redirectUri } = params
      const loginResponse = await AuthService.login(authCode, provider, redirectUri)

      this.setInitialLoginData(loginResponse)

      await this.syncUserSettings()

      const teamStore = useTeamStore()
      await teamStore.syncTeams()

      router.push(originalRoute)
    },
    async unlinkProvider(provider: AuthProvider) {
      await AuthService.unlinkProvider(provider)
      if (this.auth?.activeProvider === provider) {
        this.logout() // will wipe cache and logout
      } else {
        this.auth && (this.auth.linkedProviders[provider].linked = false)
      }
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
      clearCacheAndLogout()
      router.push('/')
    }
  },
  persist: true
})
