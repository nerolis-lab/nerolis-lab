/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRecipeDAO } from '@src/database/dao/user-recipe/user-recipe-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('UserRecipeDAO insert', () => {
  it('shall insert new user recipe entity', async () => {
    const userRecipe = await UserRecipeDAO.insert({
      fk_user_id: 1,
      recipe: 'Pikachu Surprise',
      level: 10
    });
    expect(userRecipe).toBeDefined();

    const data = await UserRecipeDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        recipe: 'Pikachu Surprise',
        level: 10,
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without fk_user_id', async () => {
    await expect(
      UserRecipeDAO.insert({
        fk_user_id: undefined as any,
        recipe: 'Pikachu Surprise',
        level: 10
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_recipe.fk_user_id/);
  });
});

describe('UserRecipeDAO update', () => {
  it('shall update user recipe entity', async () => {
    const userRecipe = await UserRecipeDAO.insert({
      fk_user_id: 1,
      recipe: 'Old Recipe',
      level: 5
    });
    expect(userRecipe.recipe).toEqual('Old Recipe');

    await UserRecipeDAO.update({
      ...userRecipe,
      recipe: 'New Recipe',
      level: 6
    });

    const data = await UserRecipeDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        recipe: 'New Recipe',
        level: 6,
        version: 2
      })
    ]);
  });
});
