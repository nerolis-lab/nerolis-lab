import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { defineStore } from 'pinia'

export interface VersionState {
  version: string
}

export const useVersionStore = defineStore('version', {
  state: (): VersionState => {
    return {
      version: '1.0.0'
    }
  },
  getters: {
    updateFound: (state) => state.version !== APP_VERSION
  },
  actions: {
    async updateVersion() {
      logger.debug(`Client updating version: ${this.version} -> ${APP_VERSION}`)
      this.version = APP_VERSION

      const avatarStore = useAvatarStore()
      await avatarStore.loadAvatars()
    }
  },
  persist: true
})
