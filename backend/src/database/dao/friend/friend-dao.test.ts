/* eslint-disable @typescript-eslint/no-explicit-any */
import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('FriendDAO insert', () => {
  it('shall insert new entity', async () => {
    const friend = await FriendDAO.insert({
      fk_user1_id: 1,
      fk_user2_id: 2
    });
    expect(friend).toBeDefined();

    const data = await FriendDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user1_id: 1,
        fk_user2_id: 2,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without fk_user1_id', async () => {
    await expect(
      FriendDAO.insert({
        fk_user1_id: undefined as any,
        fk_user2_id: 2
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: friend.fk_user1_id/);
  });

  it('shall fail to insert entity without fk_user2_id', async () => {
    await expect(
      FriendDAO.insert({
        fk_user1_id: 1,
        fk_user2_id: undefined as any
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: friend.fk_user2_id/);
  });
});

describe('FriendDAO update', () => {
  it('shall update entity', async () => {
    const friend = await FriendDAO.insert({
      fk_user1_id: 1,
      fk_user2_id: 2
    });
    expect(friend.fk_user2_id).toEqual(2);

    await FriendDAO.update({ ...friend, fk_user2_id: 3 });

    const data = await FriendDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user1_id: 1,
        fk_user2_id: 3,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        version: 2
      })
    ]);
  });
});
