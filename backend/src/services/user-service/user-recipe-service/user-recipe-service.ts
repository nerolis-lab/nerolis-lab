import { UserRecipeDAO } from '@src/database/dao/user-recipe/user-recipe-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import type { GetRecipeLevelsResponse } from 'sleepapi-common';

export async function getRecipeLevels(user: DBUser): Promise<GetRecipeLevelsResponse> {
  const userRecipeLevels = await UserRecipeDAO.findMultiple({ fk_user_id: user.id });

  const recipeLevels = userRecipeLevels.reduce((acc, { recipe, level }) => {
    acc[recipe] = level;
    return acc;
  }, {} as GetRecipeLevelsResponse);

  return recipeLevels;
}

export async function upsertRecipeLevel(params: { user: DBUser; recipe: string; level: number }) {
  const { user, recipe, level } = params;

  await UserRecipeDAO.upsert({
    updated: {
      fk_user_id: user.id,
      recipe,
      level
    },
    filter: { fk_user_id: user.id, recipe }
  });
}
