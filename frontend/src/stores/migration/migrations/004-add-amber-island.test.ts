import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { AMBER } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import migration from './004-add-amber-island'

describe('004-add-canyon-island migration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add amber island to existing islands state', () => {
    const userStore = useUserStore()

    // Remove amber if it exists (simulating old state)
    if (userStore.islands.amber) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amber, ...restIslands } = userStore.islands
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(userStore.$state as any).islands = restIslands
    }

    // Verify amber is missing
    expect(userStore.islands.amber).toBeUndefined()

    // Run migration
    migration.up({ user: userStore })

    // Check that amber island was added
    expect(userStore.islands.amber).toBeDefined()
    expect(userStore.islands.amber.name).toBe(AMBER.name)
    expect(userStore.islands.amber.shortName).toBe(AMBER.shortName)
    expect(userStore.islands.amber.berries).toEqual(AMBER.berries)
    expect(userStore.islands.amber.expert).toBe(AMBER.expert)
    expect(userStore.islands.amber.areaBonus).toBe(0)

    // Check that other islands are still present
    expect(userStore.islands.greengrass).toBeDefined()
    expect(userStore.islands.cyan).toBeDefined()
  })

  it('should not modify islands if amber already exists', () => {
    const userStore = useUserStore()

    // Ensure amber exists with a custom areaBonus
    userStore.islands.amber = {
      ...AMBER,
      areaBonus: 15
    }

    const existingAmber = { ...userStore.islands.amber }
    const existingIslands = { ...userStore.islands }

    // Run migration
    migration.up({ user: userStore })

    // Check that amber was not modified
    expect(userStore.islands.amber).toEqual(existingAmber)
    expect(userStore.islands.amber.areaBonus).toBe(15)
    expect(userStore.islands).toEqual(existingIslands)
  })
})
