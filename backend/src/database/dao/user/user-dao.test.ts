/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  vimic(uuid, 'v4', () => '0'.repeat(36));
});

describe('UserDAO insert', () => {
  it('shall insert new entity', async () => {
    const user = await UserDAO.insert({
      friend_code: generateFriendCode(),
      google_id: 'some-google_id',
      external_id: uuid.v4(),
      name: 'some-name',
      role: Roles.Default
    });
    expect(user).toBeDefined();

    const data = await UserDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        avatar: undefined,
        created_at: expect.any(Date),
        external_id: '000000000000000000000000000000000000',
        friend_code: expect.stringMatching(/^[A-Z0-9]{6}$/),
        id: 1,
        last_login: expect.any(Date),
        name: 'some-name',
        role: 'default',
        google_id: 'some-google_id',
        updated_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall auto-generate friend_code as default', async () => {
    const user = await UserDAO.insert({
      google_id: 'some-google_id',
      external_id: uuid.v4(),
      name: 'some-name',
      role: Roles.Default
    } as DBUser);
    expect(user).toBeDefined();

    const data = await UserDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        avatar: undefined,
        created_at: expect.any(Date),
        external_id: '000000000000000000000000000000000000',
        id: 1,
        last_login: expect.any(Date),
        name: 'some-name',
        role: 'default',
        google_id: 'some-google_id',
        updated_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without external_id', async () => {
    await expect(
      UserDAO.insert({
        friend_code: generateFriendCode(),
        external_id: undefined as any,
        name: 'some-name',
        google_id: 'some-google_id',
        role: Roles.Default
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user.external_id/);
  });

  it('shall fail to insert entity with google_id that already exists', async () => {
    await UserDAO.insert({
      friend_code: generateFriendCode(),
      external_id: uuid.v4(),
      google_id: 'google_id1',
      name: 'some-name',
      role: Roles.Default
    });
    await expect(
      UserDAO.insert({
        friend_code: generateFriendCode(),
        external_id: uuid.v4(),
        google_id: 'google_id2',
        name: 'some-name',
        role: Roles.Default
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: user.external_id/);
  });
});

describe('UserDAO update', () => {
  it('shall update entity', async () => {
    const user = await UserDAO.insert({
      friend_code: generateFriendCode(),
      google_id: 'some-google_id',
      external_id: uuid.v4(),
      name: 'some-name',
      role: Roles.Default
    });
    expect(user.name).toEqual('some-name');

    await UserDAO.update({ ...user, name: 'updated-name' });

    const data = await UserDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        avatar: undefined,
        created_at: expect.any(Date),
        external_id: '000000000000000000000000000000000000',
        friend_code: expect.stringMatching(/^[A-Z0-9]{6}$/),
        id: 1,
        last_login: expect.any(Date),
        name: 'updated-name',
        role: 'default',
        google_id: 'some-google_id',
        updated_at: expect.any(Date),
        version: 2
      })
    ]);
  });
});
