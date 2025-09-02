import { UserRecipeDAO } from '@src/database/dao/user/user-recipe/user-recipe-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import {
  getRecipeLevels,
  upsertRecipeLevel
} from '@src/services/user-service/user-recipe-service/user-recipe-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { Roles, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('getRecipeLevels', () => {
  it('should return an empty object if the user has no recipe levels', async () => {
    const user = await UserDAO.insert({
      google_id: 'test-google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      role: Roles.Default
    });

    const levels = await getRecipeLevels(user);
    expect(levels).toEqual({});
  });

  it('should return a proper mapping of recipe levels when records exist', async () => {
    const user = await UserDAO.insert({
      google_id: 'test-google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      role: Roles.Default
    });

    // Insert a couple of recipe level records for the user
    await UserRecipeDAO.insert({ fk_user_id: user.id, recipe: 'Pasta', level: 5 });
    await UserRecipeDAO.insert({ fk_user_id: user.id, recipe: 'Cake', level: 3 });

    const levels = await getRecipeLevels(user);
    expect(levels).toEqual({
      Pasta: 5,
      Cake: 3
    });
  });
});

describe('upsertRecipeLevel', () => {
  it('should insert a new recipe level if it does not exist', async () => {
    const user = await UserDAO.insert({
      google_id: 'insert-google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Insert User',
      role: Roles.Default
    });

    await upsertRecipeLevel({ user, recipe: 'Salad', level: 2 });

    const records = await UserRecipeDAO.findMultiple({ fk_user_id: user.id, recipe: 'Salad' });
    expect(records).toHaveLength(1);
    expect(records[0].level).toBe(2);
  });

  it('should update an existing recipe level if the record already exists', async () => {
    const user = await UserDAO.insert({
      google_id: 'update-google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Update User',
      role: Roles.Default
    });

    // First, insert the record with an initial level
    await upsertRecipeLevel({ user, recipe: 'Soup', level: 3 });
    // Now upsert with a new level
    await upsertRecipeLevel({ user, recipe: 'Soup', level: 5 });

    const records = await UserRecipeDAO.findMultiple({ fk_user_id: user.id, recipe: 'Soup' });
    expect(records).toHaveLength(1);
    expect(records[0].level).toBe(5);
  });
});
