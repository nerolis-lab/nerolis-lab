/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MockService } from '@src/utils/test-utils/mock-service.js';
import { Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  vimic(uuid, 'v4', () => '0'.repeat(36));
});

afterEach(() => {
  MockService.restore();
});

describe('UserDAO insert', () => {
  it('shall insert new entity', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
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
        id: 1,
        last_login: expect.any(Date),
        name: 'some-name',
        role: 'default',
        sub: 'some-sub',
        updated_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without sub', async () => {
    await expect(
      UserDAO.insert({
        external_id: uuid.v4(),
        name: 'some-name',
        sub: undefined as any,
        role: Roles.Default
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user.sub/);
  });

  it('shall fail to insert entity without external_id', async () => {
    await expect(
      UserDAO.insert({
        external_id: undefined as any,
        name: 'some-name',
        sub: 'some-sub',
        role: Roles.Default
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user.external_id/);
  });

  it('shall fail to insert entity with sub that already exists', async () => {
    await UserDAO.insert({
      external_id: uuid.v4(),
      sub: 'sub1',
      name: 'some-name',
      role: Roles.Default
    });
    await expect(
      UserDAO.insert({
        external_id: uuid.v4(),
        sub: 'sub1',
        name: 'some-name',
        role: Roles.Default
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: user.external_id/);
  });
});

describe('UserDAO update', () => {
  it('shall update entity', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
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
        id: 1,
        last_login: expect.any(Date),
        name: 'updated-name',
        role: 'default',
        sub: 'some-sub',
        updated_at: expect.any(Date),
        version: 2
      })
    ]);
  });
});
