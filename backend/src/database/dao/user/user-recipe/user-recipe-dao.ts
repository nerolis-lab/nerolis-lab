import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

export const DBUserRecipeSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    recipe: Type.String({ maxLength: 255 }),
    level: Type.Number()
  })
]);

export type DBUserRecipe = Static<typeof DBUserRecipeSchema>;

class UserRecipeDAOImpl extends AbstractDAO<typeof DBUserRecipeSchema> {
  public tableName = 'user_recipe';
  public schema = DBUserRecipeSchema;
}

export const UserRecipeDAO = new UserRecipeDAOImpl();
