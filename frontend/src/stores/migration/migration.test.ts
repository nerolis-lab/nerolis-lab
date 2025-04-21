import { migrateStores } from '@/stores/migration/migration' // Static import
import type { Migration } from '@/stores/migration/migration-type'
import { getMigrations } from '@/stores/migration/migration-utils'
import { useVersionStore } from '@/stores/version-store/version-store'
import type { Logger } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/stores/store-service', () => ({
  clearCacheAndLogout: vi.fn
}))

vi.mock('@/stores/migration/migration-utils', () => ({
  getMigrations: vi.fn().mockReturnValue([vi.fn(), vi.fn()]),
  getStores: vi.fn()
}))

describe('migration', () => {
  let migration1: Migration
  let migration2: Migration

  beforeEach(() => {
    global.logger = {
      debug: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger

    migration1 = {
      version: 1,
      description: 'migration 1',
      up: vi.fn().mockReturnValue(Promise.resolve())
    }
    migration2 = {
      version: 2,
      description: 'migration 2',
      up: vi.fn().mockReturnValue(Promise.resolve())
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not run any migrations if storeVersion matches the latest migration', async () => {
    const versionStore = useVersionStore()
    versionStore.storeVersion = 2

    vi.mocked(getMigrations).mockReturnValue([migration1, migration2])

    await migrateStores()

    expect(global.logger.debug).toHaveBeenCalledWith('State is up to date. No migrations needed.')
    expect(versionStore.storeVersion).toBe(2)
    expect(migration1.up).not.toHaveBeenCalled()
    expect(migration2.up).not.toHaveBeenCalled()
  })

  it('should run all pending migrations in correct version order', async () => {
    const versionStore = useVersionStore()
    versionStore.storeVersion = 0

    vi.mocked(getMigrations).mockReturnValue([migration1, migration2])
    await migrateStores()

    expect(versionStore.storeVersion).toBe(2)
    expect(migration1.up).toHaveBeenCalledTimes(1)
    expect(migration2.up).toHaveBeenCalledTimes(1)
  })

  it('should only run migrations with versions greater than current storeVersion', async () => {
    const versionStore = useVersionStore()
    versionStore.storeVersion = 1

    vi.mocked(getMigrations).mockReturnValue([migration1, migration2])

    await migrateStores()

    expect(versionStore.storeVersion).toBe(2)
    expect(migration1.up).not.toHaveBeenCalled()
    expect(migration2.up).toHaveBeenCalledTimes(1)
  })

  it('in case of error it should keep the version of the last successful migration', async () => {
    const versionStore = useVersionStore()
    versionStore.storeVersion = 0
    migration2.up = vi.fn().mockRejectedValue(new Error('Migration failed'))

    vi.mocked(getMigrations).mockReturnValue([migration1, migration2])

    await migrateStores()

    expect(migration1.up).toHaveBeenCalledTimes(1)
    expect(migration2.up).toHaveBeenCalled()
    expect(versionStore.storeVersion).toBe(1)
  })
})
