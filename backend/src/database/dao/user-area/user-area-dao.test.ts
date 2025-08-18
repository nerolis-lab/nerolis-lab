/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('UserAreaDAO insert', () => {
  it('shall insert new user area entity', async () => {
    const userArea = await UserAreaDAO.insert({
      fk_user_id: 2,
      area: 'greengrass',
      bonus: 15
    });
    expect(userArea).toBeDefined();

    const data = await UserAreaDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 2,
        area: 'greengrass',
        bonus: 15,
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without area', async () => {
    await expect(
      UserAreaDAO.insert({
        fk_user_id: 2,
        area: undefined as any,
        bonus: 15
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_area.area/);
  });

  it('shall fail to insert entity without bonus', async () => {
    await expect(
      UserAreaDAO.insert({
        fk_user_id: 2,
        area: 'greengrass',
        bonus: undefined as any
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_area.bonus/);
  });
});

describe('UserAreaDAO update', () => {
  it('shall update user area entity', async () => {
    const userArea = await UserAreaDAO.insert({
      fk_user_id: 2,
      area: 'powerplant',
      bonus: 10
    });
    expect(userArea.area).toEqual('powerplant');

    await UserAreaDAO.update({
      ...userArea,
      area: 'lapis',
      bonus: 20
    });

    const data = await UserAreaDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 2,
        area: 'lapis',
        bonus: 20,
        version: 2
      })
    ]);
  });
});
