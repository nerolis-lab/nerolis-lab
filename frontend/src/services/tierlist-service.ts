import serverAxios from '@/router/server-axios'
import type { PokemonWithTiering, TierlistSettings } from 'sleepapi-common'

class TierlistService {
  private rawFetchedData: PokemonWithTiering[] = []

  // TODO: we should be able to cache this with only DOMAIN_VERSION busting this
  public async fetchTierlist(settings: TierlistSettings): Promise<PokemonWithTiering[]> {
    const response = await serverAxios.post<PokemonWithTiering[]>('/tierlist/cooking', settings)
    this.rawFetchedData = response.data

    return this.processTierlistData(this.rawFetchedData)
  }

  private processTierlistData(data: PokemonWithTiering[]): PokemonWithTiering[] {
    const uniquePokemonMap = new Map<string, PokemonWithTiering>()

    for (const pokemonEntry of data) {
      const pokemonName = pokemonEntry.pokemonWithSettings.pokemon
      const existingEntry = uniquePokemonMap.get(pokemonName)

      if (!existingEntry || pokemonEntry.score > existingEntry.score) {
        uniquePokemonMap.set(pokemonName, pokemonEntry)
      }
    }
    return Array.from(uniquePokemonMap.values()).sort((a, b) => b.score - a.score)
  }

  public getPokemonVariants(pokemonName: string): PokemonWithTiering[] {
    return this.rawFetchedData
      .filter((entry) => entry.pokemonWithSettings.pokemon === pokemonName)
      .sort((a, b) => b.score - a.score)
  }
}

export const tierlistService = new TierlistService()
