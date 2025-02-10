/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAreaBonusDAO } from '@src/database/dao/user-area-bonus/user-area-bonus.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MockService } from '@src/utils/test-utils/mock-service.js';
import { afterEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

afterEach(() => {
  MockService.restore();
});

describe('UserAreaBonusDAO insert', () => {
  it('shall insert new user area bonus entity', async () => {
    const userAreaBonus = await UserAreaBonusDAO.insert({
      fk_user_id: 2,
      area: 'Downtown',
      bonus: 15
    });
    expect(userAreaBonus).toBeDefined();

    const data = await UserAreaBonusDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 2,
        area: 'Downtown',
        bonus: 15,
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without area', async () => {
    await expect(
      UserAreaBonusDAO.insert({
        fk_user_id: 2,
        area: undefined as any,
        bonus: 15
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_area_bonus.area/);
  });

  it('shall fail to insert entity without bonus', async () => {
    await expect(
      UserAreaBonusDAO.insert({
        fk_user_id: 2,
        area: 'Downtown',
        bonus: undefined as any
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_area_bonus.bonus/);
  });
});

describe('UserAreaBonusDAO update', () => {
  it('shall update user area bonus entity', async () => {
    const userAreaBonus = await UserAreaBonusDAO.insert({
      fk_user_id: 2,
      area: 'Old Area',
      bonus: 10
    });
    expect(userAreaBonus.area).toEqual('Old Area');

    await UserAreaBonusDAO.update({
      ...userAreaBonus,
      area: 'New Area',
      bonus: 20
    });

    const data = await UserAreaBonusDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 2,
        area: 'New Area',
        bonus: 20,
        version: 2
      })
    ]);
  });
});
