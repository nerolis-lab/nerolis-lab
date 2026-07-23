import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { CYAN_EXPERT, GREENGRASS_EXPERT } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import migration from './005-add-expert-islands'

describe('005-add-expert-islands migration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add GGEX island to existing islands state', () => {
    const userStore = useUserStore()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { GGEX, ...restIslands } = userStore.islands
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(userStore.$state as any).islands = restIslands

    expect(userStore.islands.GGEX).toBeUndefined()

    migration.up({ user: userStore })

    expect(userStore.islands.GGEX).toBeDefined()
    expect(userStore.islands.GGEX.name).toBe(GREENGRASS_EXPERT.name)
    expect(userStore.islands.GGEX.shortName).toBe('GGEX')
    expect(userStore.islands.GGEX.berries).toEqual([])
    expect(userStore.islands.GGEX.expert).toBe(true)
    expect(userStore.islands.GGEX.areaBonus).toBe(0)

    // Check that other islands are still present
    expect(userStore.islands.greengrass).toBeDefined()
    expect(userStore.islands.cyan).toBeDefined()
  })

  it('should not modify islands if GGEX already exists', () => {
    const userStore = useUserStore()

    userStore.islands.GGEX.areaBonus = 7

    const existingGgex = { ...userStore.islands.GGEX }

    migration.up({ user: userStore })

    expect(userStore.islands.GGEX).toEqual(existingGgex)
  })

  it('should add CBEX island to existing islands state', () => {
    const userStore = useUserStore()

    if (userStore.islands.CBEX) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { CBEX, ...restIslands } = userStore.islands
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(userStore.$state as any).islands = restIslands
    }

    expect(userStore.islands.CBEX).toBeUndefined()

    migration.up({ user: userStore })

    expect(userStore.islands.CBEX).toBeDefined()
    expect(userStore.islands.CBEX.name).toBe(CYAN_EXPERT.name)
    expect(userStore.islands.CBEX.shortName).toBe(CYAN_EXPERT.shortName)
    expect(userStore.islands.CBEX.berries).toEqual([])
    expect(userStore.islands.CBEX.expert).toBe(true)
    expect(userStore.islands.CBEX.areaBonus).toBe(0)

    // Check that other islands are still present
    expect(userStore.islands.greengrass).toBeDefined()
    expect(userStore.islands.cyan).toBeDefined()
  })

  it('should not modify islands if CBEX already exists', () => {
    const userStore = useUserStore()

    userStore.islands.CBEX = {
      ...CYAN_EXPERT,
      areaBonus: 15,
      berries: []
    }

    const existingCbex = { ...userStore.islands.CBEX }

    migration.up({ user: userStore })

    expect(userStore.islands.CBEX).toEqual(existingCbex)
    expect(userStore.islands.CBEX.areaBonus).toBe(15)
  })
})
