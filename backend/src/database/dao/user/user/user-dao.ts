import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { Roles } from 'sleepapi-common';

const FriendCodeType = Type.RegExp(/^[a-zA-Z0-9]{6}$/);

const DBUserSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    avatar: Type.Optional(Type.String()),
    created_at: Type.Optional(Type.Date()),
    external_id: Type.String({ minLength: 36, maxLength: 36 }),
    friend_code: FriendCodeType,
    last_login: Type.Optional(Type.Date()),
    name: Type.String(),
    role: Type.Enum(Roles),
    google_id: Type.Optional(Type.String()),
    discord_id: Type.Optional(Type.String()),
    patreon_id: Type.Optional(Type.String()),
    updated_at: Type.Optional(Type.Date())
  })
]);
export type DBUser = Static<typeof DBUserSchema>;

class UserDAOImpl extends AbstractDAO<typeof DBUserSchema> {
  public tableName = 'user';
  public schema = DBUserSchema;
}

export const UserDAO = new UserDAOImpl();
