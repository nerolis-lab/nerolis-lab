import type { GetPokemonQueryParams } from '@src/routes/pokemon-router/pokemon-router.js';
import { convertActivationsToApiFormat } from '@src/utils/mainskill-utils/mainskill-utils.js';
import { getPokemonNames } from '@src/utils/pokemon-utils/pokemon-utils.js';
import { queryAsBoolean } from '@src/utils/routing/routing-utils.js';
import tsoa from '@tsoa/runtime';
import { getPokemon } from 'sleepapi-common';
const { Controller, Path, Get, Queries, Route, Tags } = tsoa;

@Route('api/pokemon')
@Tags('pokemon')
export default class PokemonController extends Controller {
  @Get('/{name}')
  public async getPokemonWithName(@Path() name: string) {
    const pokemon = getPokemon(name);
    const skillActivations = convertActivationsToApiFormat(pokemon.skill.activations, pokemon.skill.maxLevel);

    return {
      ...pokemon,
      skill: {
        ...pokemon.skill,
        activations: skillActivations,
        description: pokemon.skill.description({ skillLevel: 1 })
      }
    };
  }

  @Get('/')
  public async getPokemon(@Queries() queryParams: GetPokemonQueryParams): Promise<string[]> {
    const params = {
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      lapis: queryAsBoolean(queryParams.lapis),
      powerplant: queryAsBoolean(queryParams.powerplant),
      amber: queryAsBoolean(queryParams.amber)
    };
    return getPokemonNames(params);
  }
}
