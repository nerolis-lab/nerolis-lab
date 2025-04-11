import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { migrateStores } from '@/stores/migration/migration'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { describe, expect, it, vi } from 'vitest'
import { useVersionStore } from './version-store'

vi.mock('@/stores/migration/migration')

describe('Version Store', () => {
  let versionStore: ReturnType<typeof useVersionStore>
  let avatarStore: ReturnType<typeof useAvatarStore>
  let teamStore: ReturnType<typeof useTeamStore>
  let comparisonStore: ReturnType<typeof useComparisonStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(() => {
    versionStore = useVersionStore()
    avatarStore = useAvatarStore()
    teamStore = useTeamStore()
    comparisonStore = useComparisonStore()
    pokemonStore = usePokemonStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(versionStore.version).toBe('1.0.0')
      expect(versionStore.storeVersion).toBe(0)
    })
  })

  describe('Getters', () => {
    it('should detect when update is found', () => {
      versionStore.version = '1.0.0'
      // @ts-expect-error APP_VERSION is defined globally
      globalThis.APP_VERSION = '2.0.0'
      expect(versionStore.updateFound).toBe(true)
    })

    it('should not detect update when versions match', () => {
      versionStore.version = '1.0.0'
      // @ts-expect-error APP_VERSION is defined globally
      globalThis.APP_VERSION = '1.0.0'
      expect(versionStore.updateFound).toBe(false)
    })
  })

  describe('Actions', () => {
    describe('migrate', () => {
      it('should not migrate when no update is found', async () => {
        versionStore.version = '1.0.0'
        // @ts-expect-error APP_VERSION is defined globally
        globalThis.APP_VERSION = '1.0.0'

        await versionStore.migrate()

        expect(migrateStores).not.toHaveBeenCalled()
      })

      it('should migrate when update is found', async () => {
        avatarStore.loadAvatars = vi.fn().mockResolvedValue(undefined)
        versionStore.version = '1.0.0'
        // @ts-expect-error APP_VERSION is defined globally
        globalThis.APP_VERSION = '2.0.0'

        await versionStore.migrate()

        expect(migrateStores).toHaveBeenCalled()
        expect(avatarStore.loadAvatars).toHaveBeenCalled()
        expect(versionStore.version).toBe('2.0.0')
      })
    })

    describe('invalidateCache', () => {
      it('should invalidate all store caches', () => {
        teamStore.invalidateCache = vi.fn()
        comparisonStore.invalidateCache = vi.fn()
        pokemonStore.invalidateCache = vi.fn()

        versionStore.invalidateCache()

        expect(teamStore.invalidateCache).toHaveBeenCalled()
        expect(comparisonStore.invalidateCache).toHaveBeenCalled()
        expect(pokemonStore.invalidateCache).toHaveBeenCalled()
      })
    })

    describe('updateStoreVersion', () => {
      it('should update store version', () => {
        versionStore.updateStoreVersion(2)
        expect(versionStore.storeVersion).toBe(2)
      })
    })

    describe('updateSiteVersion', () => {
      it('should update site version to APP_VERSION', () => {
        // @ts-expect-error APP_VERSION is defined globally
        globalThis.APP_VERSION = '2.0.0'

        versionStore.updateSiteVersion()

        expect(versionStore.version).toBe('2.0.0')
      })
    })
  })
})
