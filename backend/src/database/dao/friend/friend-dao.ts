import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

const DBFriendSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user1_id: Type.Number(),
    fk_user2_id: Type.Number(),

    updated_at: Type.Optional(Type.Date()),
    created_at: Type.Optional(Type.Date())
  })
]);
export type DBFriend = Static<typeof DBFriendSchema>;

class FriendDAOImpl extends AbstractDAO<typeof DBFriendSchema> {
  public tableName = 'friend';
  public schema = DBFriendSchema;
}

export const FriendDAO = new FriendDAOImpl();
