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
  updateFriendCode,
  updateUser,
  upsertUserSettings
} from '@src/services/user-service/user-service.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { HTTPError } from '@src/domain/error/api/api-error.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import type { IslandShortName, PokemonInstanceWithMeta, UpdateFriendCodeRequest, UpdateUserRequest } from 'sleepapi-common';
import { Roles } from 'sleepapi-common';
import { Body, Request } from 'tsoa';

export default class UserController {
  public async updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
    return updateUser(user, newSettings);
  }

  public async getUserSettings(user: DBUser) {
    return getUserSettings(user);
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

  public async updateFriendCode(
    @Request() request: AuthenticatedRequest,
    @Body() body: UpdateFriendCodeRequest
  ) {
    logger.info(`User ${request.user.username} updating friend code to ${body.newFriendCode}`);

    const { newFriendCode } = body;
    if (newFriendCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(newFriendCode)) {
      throw new HTTPError(400, 'Invalid friend code format. Must be 6 characters, A-Z, 0-9.');
    }

    const user = request.user;
    if (!user.patreon_id) {
      throw new HTTPError(403, 'Patreon account not linked. Supporter status cannot be verified.');
    }

    const patreonInfo = await PatreonProvider.isSupporter({
      patreon_id: user.patreon_id,
      previousRole: user.role,
    });
    if (patreonInfo.role !== Roles.Supporter && patreonInfo.role !== Roles.Admin) {
      throw new HTTPError(403, 'User is not a Patreon supporter.');
    }

    await updateFriendCode(user, newFriendCode);
    return { success: true, friendCode: newFriendCode };
  }
}
