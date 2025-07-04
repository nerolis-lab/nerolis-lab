import serverAxios from '@/router/server-axios'
import { UserService } from '@/services/user/user-service'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import { commonMocks } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'ok put' })),
    get: vi.fn(() => ({ data: [] })),
    delete: vi.fn(() => ({ data: 'ok del' })),
    patch: vi.fn(() => ({ data: 'ok patch' }))
  }
}))

const mockPokemon = mocks.createMockPokemon()

describe('getUserSettings', () => {
  it('should call server to get user settings', async () => {
    await UserService.getUserSettings()

    expect(serverAxios.get).toHaveBeenCalledWith('user/settings')
  })
})

describe('getUserPokemon', () => {
  it('should call server to get saved mons', async () => {
    await UserService.getUserPokemon()

    expect(serverAxios.get).toHaveBeenCalledWith('user/pokemon')
  })
})

describe('upsertPokemon', () => {
  it('should call server to get upsert mon', async () => {
    await UserService.upsertPokemon(mockPokemon)

    const req = PokemonInstanceUtils.toUpsertTeamMemberRequest(mockPokemon)

    expect(serverAxios.put).toHaveBeenCalledWith('user/pokemon', req)
  })
})

describe('deletePokemon', () => {
  it('should call server to get delete mon', async () => {
    await UserService.deletePokemon(mockPokemon.externalId)

    expect(serverAxios.delete).toHaveBeenCalledWith('user/pokemon/external-id')
  })
})

describe('updateUser', () => {
  beforeEach(() => {})

  it('should call server to update user and update store', async () => {
    const updatedUser = commonMocks.user({ name: 'New Name' })

    vi.mocked(serverAxios.patch).mockResolvedValue({ data: updatedUser })

    const userStore = useUserStore()

    await UserService.updateUser(updatedUser)

    expect(serverAxios.patch).toHaveBeenCalledWith('user', updatedUser)
    expect(userStore.name).toBe(updatedUser.name)
  })
})

describe('getRecipes', () => {
  it('should call server to get recipes', async () => {
    await UserService.getRecipes()

    expect(serverAxios.get).toHaveBeenCalledWith('user/recipe')
  })
})

describe('upsertRecipe', () => {
  it('should call server to upsert recipe', async () => {
    const mockRecipe = 'mock recipe'
    const mockLevel = 1

    await UserService.upsertRecipe(mockRecipe, mockLevel)

    expect(serverAxios.put).toHaveBeenCalledWith('user/recipe', { recipe: mockRecipe, level: mockLevel })
  })
})

describe('upsertAreaBonus', () => {
  it('should call server to upsert area bonus', async () => {
    await UserService.upsertAreaBonus('cyan', 75)

    expect(serverAxios.put).toHaveBeenCalledWith('user/area', { area: 'cyan', bonus: 75 })
  })
})

describe('upsertUserSettings', () => {
  it('should call server to upsert user settings with pot size', async () => {
    const potSize = 2000

    await UserService.upsertUserSettings({ potSize })

    expect(serverAxios.put).toHaveBeenCalledWith('user/settings', { potSize })
  })

  it('should return the response data from the server', async () => {
    const potSize = 3000
    const mockResponse = { success: true }

    vi.mocked(serverAxios.put).mockResolvedValueOnce({ data: mockResponse })

    const result = await UserService.upsertUserSettings({ potSize })

    expect(result).toEqual(mockResponse)
  })
})
