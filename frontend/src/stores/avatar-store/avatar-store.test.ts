import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

describe('Avatar Store', () => {
  it('should initialize with empty avatars', () => {
    const store = useAvatarStore()
    expect(store.avatars).toEqual({})
  })

  it('should return default avatar path if avatar name does not exist', () => {
    const store = useAvatarStore()
    store.avatars = { default: 'default.png' }
    const path = store.getAvatarPath('nonexistent')
    expect(path).toBe('/images/avatar/default.png')
  })

  it('should return correct avatar path if avatar name exists', () => {
    const store = useAvatarStore()
    store.avatars = { default: 'default.png', pikachu: 'pikachu.png' }
    const path = store.getAvatarPath('pikachu')
    expect(path).toBe('/images/avatar/pikachu.png')
  })

  it('should return base pokemon avatars', () => {
    const store = useAvatarStore()
    store.avatars = {
      default: 'default.png',
      charmander: 'portrait/charmander.png',
      pikachu: 'portrait/pikachu.png',
      shinyPikachu: 'portrait/shinyPikachu.png'
    }
    const baseAvatars = store.getBasePokemonAvatars
    expect(baseAvatars).toEqual([
      { name: 'default', path: 'default.png', pokedexNumber: 0, displayName: 'Default' },
      { name: 'charmander', path: 'portrait/charmander.png', pokedexNumber: 4, displayName: 'Charmander' },
      { name: 'pikachu', path: 'portrait/pikachu.png', pokedexNumber: 25, displayName: 'Pikachu' }
    ])
  })

  it('should return base and happy avatars if user is supporter', () => {
    const store = useAvatarStore()
    const userStore = useUserStore()
    userStore.role = Roles.Supporter

    store.avatars = {
      default: 'default.png',
      pikachu: 'portrait/pikachu.png',
      pikachu_happy: 'happy/pikachu.png'
    }
    const baseAvatars = store.getBasePokemonAvatars
    expect(baseAvatars).toEqual([
      { name: 'default', path: 'default.png', pokedexNumber: 0, displayName: 'Default' },
      { name: 'pikachu', path: 'portrait/pikachu.png', pokedexNumber: 25, displayName: 'Pikachu' },
      { name: 'pikachu_happy', path: 'happy/pikachu.png', pokedexNumber: 25, displayName: 'Pikachu' }
    ])
  })

  it('should load avatars from JSON file', async () => {
    const store = useAvatarStore()
    const mockData = { default: 'default.png', pikachu: 'pikachu.png' }
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockData)
    })
    await store.loadAvatars()
    expect(store.avatars).toEqual(mockData)
  })

  it('should handle error when loading avatars', async () => {
    const store = useAvatarStore()
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    await store.loadAvatars()
    expect(store.avatars).toEqual({ default: 'default.png' })
  })
})
