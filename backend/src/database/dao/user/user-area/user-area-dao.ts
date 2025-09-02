import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { ISLANDS, MAX_ISLAND_BONUS } from 'sleepapi-common';

const islandShortNames = ISLANDS.map((island) => island.shortName);
const IslandUnion = Type.Union(islandShortNames.map((shortName) => Type.Literal(shortName)));

export const DBUserAreaSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    area: IslandUnion,
    bonus: Type.Number({ minimum: 0, maximum: MAX_ISLAND_BONUS })
  })
]);

export type DBUserArea = Static<typeof DBUserAreaSchema>;

class UserAreaDAOImpl extends AbstractDAO<typeof DBUserAreaSchema> {
  public tableName = 'user_area';
  public schema = DBUserAreaSchema;
}

export const UserAreaDAO = new UserAreaDAOImpl();
