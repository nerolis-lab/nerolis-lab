import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import {
  deleteMember,
  deleteTeam,
  getTeams,
  upsertTeamMember,
  upsertTeamMeta
} from '@src/services/api-service/team/team-service.js';
import type { UpsertTeamMemberRequest, UpsertTeamMetaRequest } from 'sleepapi-common';

export default class TeamController {
  public async upsertMeta(index: number, request: UpsertTeamMetaRequest, user: DBUser) {
    return upsertTeamMeta({ index, request, user });
  }

  public async deleteTeam(index: number, user: DBUser) {
    return deleteTeam(index, user);
  }

  public async upsertMember(params: {
    teamIndex: number;
    memberIndex: number;
    request: UpsertTeamMemberRequest;
    user: DBUser;
  }) {
    return upsertTeamMember(params);
  }

  public async getTeams(user: DBUser) {
    return getTeams(user);
  }

  public async deleteMember(params: { teamIndex: number; memberIndex: number; user: DBUser }) {
    return deleteMember(params);
  }
}
