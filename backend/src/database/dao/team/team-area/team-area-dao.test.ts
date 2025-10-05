/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { Roles } from 'sleepapi-common';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true, enforceForeignKeyConstraints: true });

let userAreaId: number;

beforeEach(async () => {
  const user = await UserDAO.insert({
    friend_code: 'ABC123',
    external_id: '0'.repeat(36),
    name: 'Team Area User',
    role: Roles.Default
  });

  const userArea = await UserAreaDAO.insert({
    fk_user_id: user.id,
    area: 'greengrass',
    bonus: 10
  });

  userAreaId = userArea.id;
});

describe('TeamAreaDAO insert', () => {
  it('shall insert new entity', async () => {
    const teamArea = await TeamAreaDAO.insert({
      fk_user_area_id: userAreaId,
      favored_berries: 'ORAN, PAMTRE, PECHA',
      expert_modifier: 'berry'
    });
    expect(teamArea).toBeDefined();

    const data = await TeamAreaDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        version: 1,
        fk_user_area_id: userAreaId,
        favored_berries: 'ORAN, PAMTRE, PECHA',
        expert_modifier: 'berry'
      })
    ]);
  });

  it('shall insert entity without expert_modifier', async () => {
    const teamArea = await TeamAreaDAO.insert({
      fk_user_area_id: userAreaId,
      favored_berries: 'FIGY, LEPPA, SITRUS'
    });

    expect(teamArea.expert_modifier).toBeUndefined();

    const data = await TeamAreaDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: teamArea.id,
        fk_user_area_id: userAreaId,
        favored_berries: 'FIGY, LEPPA, SITRUS'
      })
    ]);
    expect(data[0].expert_modifier).toBeUndefined();
  });

  it('shall fail to insert entity without fk_user_area_id', async () => {
    await expect(
      TeamAreaDAO.insert({
        fk_user_area_id: undefined as any,
        favored_berries: 'ORAN, PAMTRE, PECHA'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_area.fk_user_area_id/);
  });

  it('shall fail to insert entity without favored_berries', async () => {
    await expect(
      TeamAreaDAO.insert({
        fk_user_area_id: userAreaId,
        favored_berries: undefined as any
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_area.favored_berries/);
  });

  it('shall fail to insert entity with invalid fk_user_area_id', async () => {
    await expect(
      TeamAreaDAO.insert({
        fk_user_area_id: 999,
        favored_berries: 'ORAN, PAMTRE, PECHA'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: FOREIGN KEY constraint failed/);
  });
});

describe('TeamAreaDAO update', () => {
  it('shall update entity', async () => {
    const teamArea = await TeamAreaDAO.insert({
      fk_user_area_id: userAreaId,
      favored_berries: 'ORAN, PAMTRE, PECHA'
    });
    expect(teamArea.favored_berries).toEqual('ORAN, PAMTRE, PECHA');

    await TeamAreaDAO.update({
      ...teamArea,
      favored_berries: 'CHERI, DURIN, MAGO',
      expert_modifier: 'skill'
    });

    const data = await TeamAreaDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: teamArea.id,
        version: 2,
        fk_user_area_id: userAreaId,
        favored_berries: 'CHERI, DURIN, MAGO',
        expert_modifier: 'skill'
      })
    ]);
  });
});

describe('TeamAreaDAO delete', () => {
  it('shall delete entity', async () => {
    const teamArea = await TeamAreaDAO.insert({
      fk_user_area_id: userAreaId,
      favored_berries: 'BELUE, BLUK, GREPA'
    });

    await TeamAreaDAO.delete({ id: teamArea.id });

    const data = await TeamAreaDAO.findMultiple();
    expect(data).toEqual([]);
  });
});
