import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

const ExpertRandomBonusType = Type.Union([Type.Literal('ingredient'), Type.Literal('berry'), Type.Literal('skill')]);

const DBTeamAreaSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_area_id: Type.Number(),
    favored_berries: Type.String(),
    expert_modifier: Type.Optional(ExpertRandomBonusType)
  })
]);
export type DBTeamArea = Static<typeof DBTeamAreaSchema>;

class TeamAreaDAOImpl extends AbstractDAO<typeof DBTeamAreaSchema> {
  public tableName = 'team_area';
  public schema = DBTeamAreaSchema;
}

export const TeamAreaDAO = new TeamAreaDAOImpl();
