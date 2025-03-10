import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import type { GetAreaBonusesResponse, IslandShortName } from 'sleepapi-common';

export async function getAreaBonuses(user: DBUser): Promise<GetAreaBonusesResponse> {
  const areaBonuses = await UserAreaDAO.findMultiple({ fk_user_id: user.id });

  return areaBonuses.reduce((acc, { area, bonus }) => {
    acc[area as keyof GetAreaBonusesResponse] = bonus;
    return acc;
  }, {} as GetAreaBonusesResponse);
}

export async function upsertAreaBonus(params: { user: DBUser; area: IslandShortName; bonus: number }) {
  const { user, area, bonus } = params;

  await UserAreaDAO.upsert({
    updated: {
      fk_user_id: user.id,
      area,
      bonus
    },
    filter: { fk_user_id: user.id, area }
  });
}
