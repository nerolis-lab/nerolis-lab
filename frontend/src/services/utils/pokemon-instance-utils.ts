import {
  CarrySizeUtils,
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  RP,
  type PokemonInstanceExt,
  type PokemonInstanceIdentity,
  type PokemonInstanceWithMeta,
  type PokemonInstanceWithoutRP
} from 'sleepapi-common'

class PokemonInstanceUtilsImpl {
  public toPokemonInstanceExt(pokemonInstance: PokemonInstanceWithMeta): PokemonInstanceExt {
    if (pokemonInstance.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (pokemonInstance.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    const pokemonWithoutRP: PokemonInstanceWithoutRP = {
      version: pokemonInstance.version,
      saved: pokemonInstance.saved,
      shiny: pokemonInstance.shiny,
      gender: pokemonInstance.gender,
      externalId: pokemonInstance.externalId,
      pokemon: getPokemon(pokemonInstance.pokemon),
      name: pokemonInstance.name,
      level: pokemonInstance.level,
      ribbon: pokemonInstance.ribbon,
      skillLevel: pokemonInstance.skillLevel,
      nature: getNature(pokemonInstance.nature),
      subskills: pokemonInstance.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: getSubskill(instancedSubskill.subskill)
      })),
      ingredients: pokemonInstance.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        ingredient: getIngredient(instancedIngredient.name),
        amount: instancedIngredient.amount
      }))
    }
    return {
      ...pokemonWithoutRP,
      // @deprecated
      carrySize: CarrySizeUtils.baseCarrySize(getPokemon(pokemonInstance.pokemon)),
      rp: new RP(pokemonWithoutRP).calc()
    }
  }

  public toUpsertTeamMemberRequest(instancedPokemon: PokemonInstanceExt): PokemonInstanceWithMeta {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      version: instancedPokemon.version,
      saved: instancedPokemon.saved,
      shiny: instancedPokemon.shiny,
      gender: instancedPokemon.gender,
      externalId: instancedPokemon.externalId,
      pokemon: instancedPokemon.pokemon.name,
      name: instancedPokemon.name,
      level: instancedPokemon.level,
      ribbon: instancedPokemon.ribbon,
      carrySize: CarrySizeUtils.baseCarrySize(instancedPokemon.pokemon),
      skillLevel: instancedPokemon.skillLevel,
      nature: instancedPokemon.nature.name,
      subskills: instancedPokemon.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: instancedSubskill.subskill.name
      })),
      ingredients: instancedPokemon.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        name: instancedIngredient.ingredient.name,
        amount: instancedIngredient.amount
      }))
    }
  }

  public toPokemonInstanceIdentity(pokemonInstance: PokemonInstanceExt): PokemonInstanceIdentity {
    return {
      pokemon: pokemonInstance.pokemon.name,
      nature: pokemonInstance.nature.name,
      subskills: pokemonInstance.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: pokemonInstance.ingredients.map((ingredient) => ({
        level: ingredient.level,
        name: ingredient.ingredient.name,
        amount: ingredient.amount
      })),
      carrySize: CarrySizeUtils.baseCarrySize(pokemonInstance.pokemon),
      level: pokemonInstance.level,
      ribbon: pokemonInstance.ribbon,
      skillLevel: pokemonInstance.skillLevel,
      externalId: pokemonInstance.externalId
    }
  }
}

export const PokemonInstanceUtils = new PokemonInstanceUtilsImpl()
