import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { FriendService } from '@src/services/friend-service/friend-service.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import type { IslandShortName, UpdateUserRequest, UserSettingsResponse } from 'sleepapi-common';
import { MAX_POT_SIZE } from 'sleepapi-common';

export async function updateUser(user: DBUser, newSettings: UpdateUserRequest) {
  if (newSettings.friend_code) {
    // will throw if invalid user/patreon status/friend code format
    await FriendService.validateFriendCodeUpdate(user, newSettings.friend_code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { google_id, discord_id, patreon_id, ...rest } = await UserDAO.update({ ...user, ...newSettings });
  return rest;
}

export async function deleteUser(user: DBUser) {
  UserDAO.delete({ id: user.id });
}

export async function getUserSettings(user: DBUser): Promise<UserSettingsResponse> {
  const areaBonusesRaw = await UserAreaDAO.findMultiple({ fk_user_id: user.id });

  const areaBonuses: Partial<Record<IslandShortName, number>> = {};
  for (const areaBonus of areaBonusesRaw) {
    areaBonuses[areaBonus.area] = areaBonus.bonus;
  }

  let supporterSince: string | null = null;
  if (user.patreon_id) {
    const { role, patronSince } = await PatreonProvider.isSupporter({
      patreon_id: user.patreon_id,
      previousRole: user.role
    });

    await UserDAO.update({ ...user, role });
    supporterSince = patronSince;
  }

  const userSettings = await UserSettingsDAO.find({ fk_user_id: user.id });
  const potSize = userSettings?.pot_size ?? MAX_POT_SIZE;

  return {
    name: user.name,
    avatar: user.avatar ?? 'default',
    role: user.role,
    areaBonuses,
    potSize,
    supporterSince
  };
}

export async function upsertUserSettings(user: DBUser, potSize: number) {
  await UserSettingsDAO.upsert({
    updated: { fk_user_id: user.id, pot_size: potSize },
    filter: { fk_user_id: user.id }
  });
}
