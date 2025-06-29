import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import {
  Optimal,
  uuid,
  type CalculateIvResponse,
  type PokemonInstanceExt,
  type PokemonInstanceIdentity,
  type TeamSettings
} from 'sleepapi-common'

export interface QuickCalculatorRequest {
  pokemon: PokemonInstanceExt
  settings: TeamSettings
  e4eProcs?: number
}

export interface QuickCalculatorResponse {
  production: {
    current: unknown // MemberProductionBase from the single Pokemon
    variants: unknown[] // Optimal berry/ingredient/skill variants for IV chart
  }
  pokemon: PokemonInstanceExt
}

class QuickCalculatorServiceImpl {
  public async calculate(request: QuickCalculatorRequest): Promise<QuickCalculatorResponse> {
    const { pokemon, settings, e4eProcs } = request

    const parsedMember: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity(pokemon)

    // Create optimal variants for IV comparison (berry, ingredient, skill)
    const berrySetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...pokemon,
      ...Optimal.berry(pokemon.pokemon, pokemon.ribbon, pokemon.skillLevel),
      externalId: uuid.v4()
    })
    const ingredientSetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...pokemon,
      ...Optimal.ingredient(pokemon.pokemon, pokemon.ribbon, pokemon.skillLevel),
      externalId: uuid.v4()
    })
    const skillSetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...pokemon,
      ...Optimal.skill(pokemon.pokemon, pokemon.ribbon, pokemon.skillLevel),
      externalId: uuid.v4()
    })

    const requestBody = {
      members: [parsedMember],
      variants: [parsedMember, berrySetup, ingredientSetup, skillSetup],
      settings: {
        ...settings,
        externalE4eProcs: e4eProcs
      }
    }

    const response = await serverAxios.post<CalculateIvResponse>('/calculator/quick', requestBody)

    return {
      production: {
        current: response.data.variants[0], // The actual Pokemon production
        variants: response.data.variants // All variants for IV chart
      },
      pokemon
    }
  }

  public getDefaultSettings(): TeamSettings {
    return {
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      stockpiledIngredients: []
    }
  }

  public createDefaultPokemon(_pokemonName: string): PokemonInstanceExt {
    // This will be implemented when we create the Pokemon input components
    // For now, return a placeholder
    throw new Error('Default Pokemon creation not implemented yet')
  }
}

export const QuickCalculatorService = new QuickCalculatorServiceImpl()
