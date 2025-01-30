import { findPokemon } from '@/stores/avatar-store/avatar-utils'
import { defineStore } from 'pinia'

export interface AvatarState {
  avatars: Record<string, string>
}

export interface Avatar {
  name: string
  path: string
  displayName: string
  pokedexNumber: number
}

export const useAvatarStore = defineStore('avatar', {
  state: (): AvatarState => ({
    avatars: {}
  }),

  getters: {
    getAvatarPath:
      (state) =>
      (avatarName: string): string => {
        const relativePath = state.avatars[avatarName] ?? state.avatars['default']
        return relativePath ? `/images/avatar/${relativePath}` : '/images/avatar/default.png'
      },
    getBasePokemonAvatars: (state) => {
      const result: Avatar[] = [
        { name: 'default', path: state.avatars['default'], displayName: 'Default', pokedexNumber: 0 }
      ]

      const basePokemon = Object.entries(state.avatars)
        .filter(([name, path]) => path.includes('portrait/') && !name.includes('shiny'))
        .map(([name, path]) => {
          const pokemon = findPokemon(name)
          return {
            name,
            path,
            displayName: pokemon.displayName,
            pokedexNumber: pokemon.pokedexNumber
          }
        })
        .sort((a, b) => a.pokedexNumber - b.pokedexNumber)

      return result.concat(basePokemon)
    }
  },
  actions: {
    async loadAvatars(): Promise<void> {
      try {
        logger.info('Repopulating avatars')
        const response = await fetch('/images/avatar/avatars.json')
        const data = await response.json()
        this.avatars = data
      } catch {
        logger.error('Error loading avatars.json')
        this.avatars = { default: 'default.png' }
      }
    }
  },
  persist: true
})
