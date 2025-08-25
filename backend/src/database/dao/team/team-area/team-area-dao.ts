import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { ISLANDS } from 'sleepapi-common';

const islandShortNames = ISLANDS.map((island) => island.shortName);
const IslandUnion = Type.Union(islandShortNames.map((shortName) => Type.Literal(shortName)));

const ExpertRandomBonusType = Type.Union([Type.Literal('ingredient'), Type.Literal('berry'), Type.Literal('skill')]);

const DBTeamAreaSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_area_id: Type.Number(),
    island: IslandUnion,
    favored_berries: Type.Optional(Type.String()),
    expert_modifier: Type.Optional(ExpertRandomBonusType)
  })
]);
export type DBTeamArea = Static<typeof DBTeamAreaSchema>;

class TeamAreaDAOImpl extends AbstractDAO<typeof DBTeamAreaSchema> {
  public tableName = 'team_area';
  public schema = DBTeamAreaSchema;
}

export const TeamAreaDAO = new TeamAreaDAOImpl();
