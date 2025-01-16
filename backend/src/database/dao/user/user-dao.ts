import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { Roles } from 'sleepapi-common';

const DBUserSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    sub: Type.String(),
    external_id: Type.String({ minLength: 36, maxLength: 36 }),
    name: Type.String(),
    avatar: Type.Optional(Type.String()),
    role: Type.Enum(Roles),
    last_login: Type.Optional(Type.Date()),
    updated_at: Type.Optional(Type.Date()),
    created_at: Type.Optional(Type.Date())
  })
]);
export type DBUser = Static<typeof DBUserSchema>;

class UserDAOImpl extends AbstractDAO<typeof DBUserSchema> {
  public tableName = 'user';
  public schema = DBUserSchema;
}

export const UserDAO = new UserDAOImpl();
