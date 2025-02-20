import serverAxios from '@/router/server-axios'
import { UserService } from '@/services/user/user-service'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import { createMockPokemon } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'ok put' })),
    get: vi.fn(() => ({ data: [] })),
    delete: vi.fn(() => ({ data: 'ok del' })),
    patch: vi.fn(() => ({ data: 'ok patch' }))
  }
}))

const mockPokemon = createMockPokemon()

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
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should call server to update user and update store', async () => {
    const updatedUser = { name: 'New Name' }

    const userStore = useUserStore()
    userStore.setUserData = vi.fn()

    await UserService.updateUser(updatedUser)

    expect(serverAxios.patch).toHaveBeenCalledWith('user', updatedUser)

    expect(userStore.setUserData).toHaveBeenCalled()
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
