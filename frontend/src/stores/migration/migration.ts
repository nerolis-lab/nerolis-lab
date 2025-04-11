import { getMigrations, getStores } from '@/stores/migration/migration-utils'
import { clearCacheAndLogout } from '@/stores/store-service'
import { useVersionStore } from '@/stores/version-store/version-store'

export async function migrateStores() {
  const versionStore = useVersionStore()
  const currentVersion = versionStore.storeVersion

  const migrations = getMigrations()

  const pendingMigrations = migrations.filter((m) => m.version > currentVersion)

  if (pendingMigrations.length === 0) {
    logger.debug('State is up to date. No migrations needed.')
    return
  }

  logger.info(`Found ${pendingMigrations.length} pending migrations to run.`)

  const stores = getStores()

  for (const migration of pendingMigrations) {
    logger.info(`Running migration ${migration.version}: ${migration.description}`)
    try {
      await migration.up(stores)

      versionStore.updateStoreVersion(migration.version)
      logger.debug(`Successfully migrated to version ${migration.version}.`)
    } catch (error) {
      logger.error(`Failed to apply migration ${migration.version}: ${error}`)
      logger.error(`Logging out and clearing application data.`)
      clearCacheAndLogout()
      return
    }
  }

  logger.debug(`Migrations complete. Current state version is now ${versionStore.storeVersion}.`)
}
