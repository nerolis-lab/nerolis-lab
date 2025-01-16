import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { createPinia, setActivePinia } from 'pinia'
import 'sleepapi-common'
// import { vimic } from 'vimic'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useVersionStore } from './version-store'

const MOCK_APP_VERSION = '2.0.0'

describe('useVersionStore', () => {
  // let mockDebug: MockInstance

  beforeEach(() => {
    vi.stubGlobal('APP_VERSION', MOCK_APP_VERSION)
    setActivePinia(createPinia())
    // mockDebug = vimic(logger, 'debug')
  })

  it('initializes with correct version', () => {
    const versionStore = useVersionStore()
    expect(versionStore.version).toBe('1.0.0')
  })

  it('getter updateFound returns false when versions match', () => {
    const versionStore = useVersionStore()
    versionStore.version = MOCK_APP_VERSION
    expect(versionStore.updateFound).toBe(false)
  })

  it('getter updateFound returns true when versions do not match', () => {
    const versionStore = useVersionStore()
    versionStore.version = '1.0.1'
    expect(versionStore.updateFound).toBe(true)
  })

  it('updates version correctly using updateVersion action', () => {
    const versionStore = useVersionStore()
    const avatarStore = useAvatarStore()
    avatarStore.loadAvatars = vi.fn()

    versionStore.version = '1.0.0'
    expect(versionStore.version).toBe('1.0.0')
    versionStore.updateVersion()
    expect(versionStore.version).toBe(MOCK_APP_VERSION)
    // expect(mockDebug).toHaveBeenCalledWith('Client updating version: 1.0.0 -> 2.0.0')
    expect(avatarStore.loadAvatars).toHaveBeenCalled()
  })
})
