import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { EXPERT_ISLANDS, ISLANDS } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import migration, { type UserStateV2 } from './003-islands-structure'

describe('003-islands-structure migration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should migrate areaBonus to islands structure', () => {
    const userStore = useUserStore()

    // Set up state with old areaBonus structure
    ;(userStore.$state as unknown as UserStateV2).areaBonus = {
      cyan: 10,
      greengrass: 20,
      lapis: 30,
      powerplant: 0,
      snowdrop: 15,
      taupe: 5,
      GGEX: 0
    }

    // Run migration
    migration.up({ user: userStore })

    // Check that islands structure is created correctly
    const allIslands = [...ISLANDS, ...EXPERT_ISLANDS]
    expect(userStore.islands).toBeDefined()

    // Check each island has the correct structure and area bonus
    for (const island of allIslands) {
      const userIsland = userStore.islands[island.shortName]
      expect(userIsland).toBeDefined()
      expect(userIsland.name).toBe(island.name)
      expect(userIsland.shortName).toBe(island.shortName)
      expect(userIsland.berries).toEqual(island.berries)

      // Check area bonus was migrated correctly
      if (island.shortName === 'cyan') {
        expect(userIsland.areaBonus).toBe(10)
      } else if (island.shortName === 'greengrass') {
        expect(userIsland.areaBonus).toBe(20)
      } else if (island.shortName === 'lapis') {
        expect(userIsland.areaBonus).toBe(30)
      } else if (island.shortName === 'powerplant') {
        expect(userIsland.areaBonus).toBe(0)
      } else if (island.shortName === 'snowdrop') {
        expect(userIsland.areaBonus).toBe(15)
      } else if (island.shortName === 'taupe') {
        expect(userIsland.areaBonus).toBe(5)
      } else {
        // Expert islands should default to 0
        expect(userIsland.areaBonus).toBe(0)
      }
    }

    // Check that old areaBonus field is removed
    expect((userStore as unknown as UserStateV2).areaBonus).toBeUndefined()
  })

  it('should handle missing areaBonus values', () => {
    const userStore = useUserStore()

    // Set up state with partial areaBonus
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(userStore.$state as any).areaBonus = {
      cyan: 25,
      lapis: 50
    }

    // Run migration
    migration.up({ user: userStore })

    // Check that missing values default to 0
    expect(userStore.islands.cyan.areaBonus).toBe(25)
    expect(userStore.islands.lapis.areaBonus).toBe(50)
    expect(userStore.islands.greengrass.areaBonus).toBe(0)
    expect(userStore.islands.powerplant.areaBonus).toBe(0)
    expect(userStore.islands.snowdrop.areaBonus).toBe(0)
    expect(userStore.islands.taupe.areaBonus).toBe(0)
  })

  it('should not run if areaBonus does not exist', () => {
    const userStore = useUserStore()

    // State already has islands structure
    const initialIslands = userStore.islands

    // Run migration
    migration.up({ user: userStore })

    // Islands should remain unchanged
    expect(userStore.islands).toEqual(initialIslands)
  })
})
