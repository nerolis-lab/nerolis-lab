import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

export const DBUserAreaBonusSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    area: Type.String({ maxLength: 255 }),
    bonus: Type.Number()
  })
]);

export type DBUserAreaBonus = Static<typeof DBUserAreaBonusSchema>;

class UserAreaBonusDAOImpl extends AbstractDAO<typeof DBUserAreaBonusSchema> {
  public tableName = 'user_area_bonus';
  public schema = DBUserAreaBonusSchema;
}

export const UserAreaBonusDAO = new UserAreaBonusDAOImpl();
