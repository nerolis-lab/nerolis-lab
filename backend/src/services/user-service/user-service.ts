import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import type { DBUserSettings } from '@src/database/dao/user-settings/user-settings-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import type { IslandShortName, UpdateUserRequest, UserSettingsRequest, UserSettingsResponse } from 'sleepapi-common';
import { MAX_POT_SIZE } from 'sleepapi-common';

export async function updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
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
  const useRandomName = userSettings?.use_random_name ?? true;

  return {
    name: user.name,
    avatar: user.avatar ?? 'default',
    role: user.role,
    areaBonuses,
    potSize,
    supporterSince,
    useRandomName
  };
}

export async function upsertUserSettings(user: DBUser, settings: UserSettingsRequest) {
  const updatedSettings: Partial<Omit<DBUserSettings, 'id' | 'version'>> = {
    fk_user_id: user.id
  };

  if (settings.potSize !== undefined) {
    updatedSettings.pot_size = settings.potSize;
  }

  if (settings.useRandomName !== undefined) {
    updatedSettings.use_random_name = settings.useRandomName;
  }

  // Avoid upserting if only fk_user_id is present (i.e. no actual settings are being changed)
  // However, the UserSettingsRequest currently requires potSize, so this check might be redundant
  // unless UserSettingsRequest changes. But it's good practice.
  if (Object.keys(updatedSettings).length > 1) {
    await UserSettingsDAO.upsert({
      updated: updatedSettings,
      filter: { fk_user_id: user.id }
    });
  }

  return;
}
