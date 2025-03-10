import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import type {
  GetRecipeLevelsResponse,
  IslandShortName,
  PokemonInstanceExt,
  PokemonInstanceWithMeta,
  UpsertAreaBonusRequest,
  UpsertRecipeLevelRequest,
  User,
  UserSettingsResponse
} from 'sleepapi-common'

class UserServiceImpl {
  public async getUserSettings() {
    const response = await serverAxios.get<UserSettingsResponse>('user/settings')
    return response.data
  }

  public async getUserPokemon() {
    const response = await serverAxios.get<PokemonInstanceWithMeta[]>('user/pokemon')

    const savedPokemon = response.data

    return savedPokemon.map(PokemonInstanceUtils.toPokemonInstanceExt)
  }

  public async upsertPokemon(pokemonInstance: PokemonInstanceExt) {
    const request = PokemonInstanceUtils.toUpsertTeamMemberRequest(pokemonInstance)
    return serverAxios.put('user/pokemon', request)
  }

  public async deletePokemon(externalId: string) {
    return serverAxios.delete(`user/pokemon/${externalId}`)
  }

  public async updateUser(updated: Partial<User>) {
    const response = (await serverAxios.patch<User>(`user`, updated)).data
    const userStore = useUserStore()

    userStore.setUserData({
      name: response.name,
      email: userStore.email!,
      externalId: response.external_id,
      role: response.role,
      avatar: response.avatar
    })
  }

  public async getRecipes(): Promise<GetRecipeLevelsResponse> {
    const response = await serverAxios.get<GetRecipeLevelsResponse>('user/recipe')
    return response.data
  }

  public async upsertRecipe(recipe: string, level: number) {
    const response = await serverAxios.put<UpsertRecipeLevelRequest>('user/recipe', { recipe, level })
    return response.data
  }

  public async upsertAreaBonus(shortName: IslandShortName, bonus: number) {
    const response = await serverAxios.put<UpsertAreaBonusRequest>('user/area', { area: shortName, bonus })
    return response.data
  }
}

export const UserService = new UserServiceImpl()
