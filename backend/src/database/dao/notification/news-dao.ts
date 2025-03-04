import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

const DBNewsSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_author_id: Type.Number(),
    title: Type.String({ maxLength: 255 }),
    content: Type.String(),

    created_at: Type.Optional(Type.Date())
  })
]);
export type DBNews = Static<typeof DBNewsSchema>;

class NewsDAOImpl extends AbstractDAO<typeof DBNewsSchema> {
  public tableName = 'news';
  public schema = DBNewsSchema;
}

export const NewsDAO = new NewsDAOImpl();
