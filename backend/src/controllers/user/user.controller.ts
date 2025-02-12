import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { deleteUser, getUser, updateUser } from '@src/services/user-service/login-service/login-service.js';
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
import type { PokemonInstanceWithMeta, UpdateUserRequest } from 'sleepapi-common';

export default class UserController {
  // User
  public async getUser(user: DBUser) {
    return getUser(user);
  }

  public async updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
    return updateUser(user, newSettings);
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
    getRecipeLevels(user);
  }

  public async upsertRecipeLevel(params: { user: DBUser; recipe: string; level: number }) {
    upsertRecipeLevel(params);
  }

  // User area bonus
  public async getUserAreaBonuses(user: DBUser) {
    getAreaBonuses(user);
  }

  public async upsertAreaBonus(params: { user: DBUser; area: string; bonus: number }) {
    upsertAreaBonus(params);
  }
}
