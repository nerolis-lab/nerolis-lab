import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { getUsers } from '@src/services/admin-service/admin-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  vimic(uuid, 'v4', () => '0'.repeat(36));
});

describe('getUsers', () => {
  it('shall return all users', async () => {
    const user = await UserDAO.insert({
      google_id: 'some-google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'some-name',
      role: Roles.Default
    });
    expect(user).toBeDefined();

    const result = await getUsers();
    expect(result).toEqual(
      expect.objectContaining({
        users: [
          {
            avatar: undefined,
            created_at: expect.any(Date),
            external_id: '000000000000000000000000000000000000',
            id: 1,
            friend_code: 'TESTFC',
            last_login: expect.any(Date),
            name: 'some-name',
            role: 'default',
            updated_at: expect.any(Date),
            version: 1
          }
        ]
      })
    );
  });
});
