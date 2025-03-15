import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { MAX_POT_SIZE, MIN_POT_SIZE } from 'sleepapi-common';

export const DBUserSettingsSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    pot_size: Type.Number({ minimum: MIN_POT_SIZE, maximum: MAX_POT_SIZE })
  })
]);

export type DBUserSettings = Static<typeof DBUserSettingsSchema>;

class UserSettingsDAOImpl extends AbstractDAO<typeof DBUserSettingsSchema> {
  public tableName = 'user_settings';
  public schema = DBUserSettingsSchema;
}

export const UserSettingsDAO = new UserSettingsDAOImpl();
