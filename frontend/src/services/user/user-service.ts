import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import type { PokemonInstanceExt, PokemonInstanceWithMeta, User } from 'sleepapi-common'

class UserServiceImpl {
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
}

export const UserService = new UserServiceImpl()
