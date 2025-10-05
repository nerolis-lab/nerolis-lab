import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { Roles } from 'sleepapi-common';
export function dbUser(attrs?: Partial<DBUser>): DBUser {
  return {
    id: 1,
    name: 'Mock user',
    role: Roles.Default,
    avatar: undefined,

    google_id: undefined,
    discord_id: undefined,
    patreon_id: undefined,

    friend_code: 'TESTFC',

    external_id: 'Mock external id',
    version: 1,
    created_at: new Date(),
    last_login: new Date(),
    updated_at: new Date(),
    ...attrs
  };
}
