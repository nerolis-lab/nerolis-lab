import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { getAreaBonuses, upsertAreaBonus } from '@src/services/user-service/user-area-service/user-area-service.js';
import {
  deletePokemon,
  getSavedPokemon,
  upsertPokemon
} from '@src/services/user-service/user-pokemon-service/user-pokemon.js';
import {
  getRecipeLevels,
  upsertRecipeLevel
} from '@src/services/user-service/user-recipe-service/user-recipe-service.js';
import {
  deleteUser,
  getUserSettings,
  updateUser,
  upsertUserSettings
} from '@src/services/user-service/user-service.js';
import type { IslandShortName, PokemonInstanceWithMeta, UpdateUserRequest, UserHeader } from 'sleepapi-common';

export default class UserController {
  public async updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
    return updateUser(user, newSettings);
  }

  public async getUserSettings(user: DBUser, userHeader: UserHeader) {
    return getUserSettings(user, userHeader);
  }

  public async upsertUserSettings(user: DBUser, potSize: number) {
    return upsertUserSettings(user, potSize);
  }

  public async deleteUser(user: DBUser) {
    return deleteUser(user);
  }

  // User Pokémon
  public async getUserPokemon(user: DBUser) {
    return getSavedPokemon(user);
  }

  public async upsertPokemon(params: { user: DBUser; pokemonInstance: PokemonInstanceWithMeta }) {
    return upsertPokemon(params);
  }

  public async deletePokemon(params: { user: DBUser; externalId: string }) {
    return deletePokemon(params);
  }

  // User recipe level
  public async getUserRecipeLevels(user: DBUser) {
    return getRecipeLevels(user);
  }

  public async upsertRecipeLevel(params: { user: DBUser; recipe: string; level: number }) {
    return upsertRecipeLevel(params);
  }

  // User area bonus
  public async getUserAreaBonuses(user: DBUser) {
    return getAreaBonuses(user);
  }

  public async upsertAreaBonus(params: { user: DBUser; area: IslandShortName; bonus: number }) {
    return upsertAreaBonus(params);
  }
}
