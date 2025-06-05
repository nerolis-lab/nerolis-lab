import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { CarrySizeUtils, getPokemon, type PokemonInstanceWithMeta } from 'sleepapi-common';

export async function getSavedPokemon(user: DBUser): Promise<PokemonInstanceWithMeta[]> {
  const userPokemon = await PokemonDAO.findMultiple({ fk_user_id: user.id, saved: true });

  return userPokemon.map((pkmn) => ({
    externalId: pkmn.external_id,
    version: pkmn.version,
    saved: pkmn.saved,
    shiny: pkmn.shiny,
    gender: pkmn.gender,
    pokemon: pkmn.pokemon,
    name: pkmn.name,
    level: pkmn.level,
    ribbon: pkmn.ribbon,
    carrySize: pkmn.carry_size,
    skillLevel: pkmn.skill_level,
    nature: pkmn.nature,
    subskills: PokemonDAO.filterFilledSubskills(pkmn),
    ingredients: PokemonDAO.filterChosenIngredientList(pkmn)
  }));
}

export async function upsertPokemon(params: { user: DBUser; pokemonInstance: PokemonInstanceWithMeta }) {
  const { user, pokemonInstance } = params;

  const upsertedPokemon = await PokemonDAO.upsert({
    updated: {
      external_id: pokemonInstance.externalId,
      fk_user_id: user.id,
      saved: pokemonInstance.saved,
      shiny: pokemonInstance.shiny,
      gender: pokemonInstance.gender,
      pokemon: pokemonInstance.pokemon,
      name: pokemonInstance.name,
      level: pokemonInstance.level,
      ribbon: pokemonInstance.ribbon,
      carry_size: CarrySizeUtils.baseCarrySize(getPokemon(pokemonInstance.pokemon)),
      skill_level: pokemonInstance.skillLevel,
      nature: pokemonInstance.nature,
      subskill_10: PokemonDAO.subskillForLevel(10, pokemonInstance.subskills),
      subskill_25: PokemonDAO.subskillForLevel(25, pokemonInstance.subskills),
      subskill_50: PokemonDAO.subskillForLevel(50, pokemonInstance.subskills),
      subskill_75: PokemonDAO.subskillForLevel(75, pokemonInstance.subskills),
      subskill_100: PokemonDAO.subskillForLevel(100, pokemonInstance.subskills),
      ingredient_0: PokemonDAO.ingredientForLevel(0, pokemonInstance.ingredients),
      ingredient_30: PokemonDAO.ingredientForLevel(30, pokemonInstance.ingredients),
      ingredient_60: PokemonDAO.ingredientForLevel(60, pokemonInstance.ingredients)
    },
    filter: { external_id: pokemonInstance.externalId }
  });

  // if not saved, check if any teams use it, if not delete
  // we upsert first above always since we need to get the id anyway
  if (!pokemonInstance.saved) {
    const usedInTeams = await TeamMemberDAO.findMultiple({ fk_pokemon_id: upsertedPokemon.id });
    if (usedInTeams.length === 0) {
      await PokemonDAO.delete(upsertedPokemon);
    }
  }
}

export async function deletePokemon(params: { user: DBUser; externalId: string }) {
  const { user, externalId } = params;

  PokemonDAO.delete({ fk_user_id: user.id, external_id: externalId });
}
