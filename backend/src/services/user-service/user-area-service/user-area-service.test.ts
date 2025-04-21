import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { getAreaBonuses, upsertAreaBonus } from '@src/services/user-service/user-area-service/user-area-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MockService } from '@src/utils/test-utils/mock-service.js';
import { Roles, uuid } from 'sleepapi-common';
import { afterEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

afterEach(() => {
  MockService.restore();
});

describe('getAreaBonuses', () => {
  it('should return an empty object if no area bonuses exist for the user', async () => {
    const user = await UserDAO.insert({
      google_id: 'area-google_id-empty',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'No Bonus User',
      role: Roles.Default
    });

    const bonuses = await getAreaBonuses(user);
    expect(bonuses).toEqual({});
  });

  it('should return a proper mapping of area bonuses when records exist', async () => {
    const user = await UserDAO.insert({
      google_id: 'area-google_id-mapping',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Mapping User',
      role: Roles.Default
    });

    // Insert some area bonus records
    await UserAreaDAO.insert({ fk_user_id: user.id, area: 'greengrass', bonus: 10 });
    await UserAreaDAO.insert({ fk_user_id: user.id, area: 'powerplant', bonus: 20 });

    const bonuses = await getAreaBonuses(user);
    expect(bonuses).toEqual({
      greengrass: 10,
      powerplant: 20
    });
  });
});

describe('upsertAreaBonus', () => {
  it('should insert a new area bonus if it does not exist', async () => {
    const user = await UserDAO.insert({
      google_id: 'upsert-google_id-insert',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Insert User',
      role: Roles.Default
    });

    await upsertAreaBonus({ user, area: 'greengrass', bonus: 15 });

    const records = await UserAreaDAO.findMultiple({ fk_user_id: user.id, area: 'greengrass' });
    expect(records).toHaveLength(1);
    expect(records[0].bonus).toBe(15);
  });

  it('should update an existing area bonus if the record already exists', async () => {
    const user = await UserDAO.insert({
      google_id: 'upsert-google_id-update',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Update User',
      role: Roles.Default
    });

    await upsertAreaBonus({ user, area: 'greengrass', bonus: 5 });
    await upsertAreaBonus({ user, area: 'greengrass', bonus: 12 });

    const records = await UserAreaDAO.findMultiple();
    expect(records).toHaveLength(1);
    expect(records[0].bonus).toBe(12);
  });
});
