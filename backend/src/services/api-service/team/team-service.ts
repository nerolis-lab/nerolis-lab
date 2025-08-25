import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import type { DBTeamWithoutVersion } from '@src/database/dao/team/team/team-dao.js';
import { TeamDAO } from '@src/database/dao/team/team/team-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { runInTransaction } from '@src/utils/database-utils/transaction-utils.js';
import type { UpsertTeamMetaRequest } from 'sleepapi-common';
import {
  CarrySizeUtils,
  getPokemon,
  type GetTeamsResponse,
  type UpsertTeamMemberRequest,
  type UpsertTeamMemberResponse,
  type UpsertTeamMetaResponse
} from 'sleepapi-common';

export async function upsertTeamMeta(
  index: number,
  request: UpsertTeamMetaRequest,
  user: DBUser
): Promise<UpsertTeamMetaResponse> {
  return runInTransaction(async (trx) => {
    const userArea = await UserAreaDAO.upsert({
      filter: { fk_user_id: user.id, area: request.island.shortName },
      updated: {
        fk_user_id: user.id,
        area: request.island.shortName,
        bonus: request.island.areaBonus ?? 0
      },
      options: { trx }
    });
    const teamArea = await TeamAreaDAO.upsert({
      filter: { fk_user_area_id: userArea.id },
      updated: {
        fk_user_area_id: userArea.id,
        island: request.island.shortName,
        favored_berries: request.island.berries.map((b) => b.name).join(','),
        expert_modifier: request.island.expertModifier
      },
      options: { trx }
    });

    const team: DBTeamWithoutVersion = {
      fk_user_id: user.id,
      fk_team_area_id: teamArea.id,
      team_index: index,
      name: request.name,
      camp: request.camp,
      bedtime: request.bedtime,
      wakeup: request.wakeup,
      recipe_type: request.recipeType,
      stockpiled_ingredients: TeamDAO.stockpileToString(request.stockpiledIngredients),
      stockpiled_berries: TeamDAO.stockpileToString(request.stockpiledBerries)
    };

    const upsertedTeam = await TeamDAO.upsert({
      updated: team,
      filter: { fk_user_id: team.fk_user_id, team_index: team.team_index }
    });

    return {
      index: upsertedTeam.team_index,
      name: upsertedTeam.name,
      camp: upsertedTeam.camp,
      bedtime: upsertedTeam.bedtime,
      wakeup: upsertedTeam.wakeup,
      recipeType: upsertedTeam.recipe_type,
      island: request.island,
      stockpiledBerries: TeamDAO.stringToStockpile(upsertedTeam.stockpiled_berries, true),
      stockpiledIngredients: TeamDAO.stringToStockpile(upsertedTeam.stockpiled_ingredients, false),
      version: upsertedTeam.version
    };
  });
}

export async function deleteTeam(index: number, user: DBUser) {
  return runInTransaction(async (trx) => {
    const team = await TeamDAO.get({ fk_user_id: user.id, team_index: index }, { trx });
    const teamMembers = await TeamMemberDAO.findMultiple({ fk_team_id: team.id }, { trx });

    for (const teamMember of teamMembers) {
      const pkmn = await PokemonDAO.get({ id: teamMember.fk_pokemon_id }, { trx });
      if (!pkmn.saved) {
        await PokemonDAO.delete(pkmn, { trx });
      }
    }

    await TeamDAO.delete(team, { trx });
  });
}

// TODO: is the team create even used/relied on here?
export async function upsertTeamMember(params: {
  teamIndex: number;
  memberIndex: number;
  request: UpsertTeamMemberRequest;
  user: DBUser;
}): Promise<UpsertTeamMemberResponse> {
  const { teamIndex, memberIndex, request, user } = params;

  // TODO: this needs big clean up
  return runInTransaction(async (trx) => {
    const team = await TeamDAO.find({ fk_user_id: user.id, team_index: teamIndex }, { trx });
    if (!team?.fk_team_area_id) {
      // TODO: create team area and user area
      // TODO: this is annoying, but it's just because somehow we're creating teams here
    }

    // TODO: is it not a little weird that we upsert team here? We could just update the version on it if that's what we want to do
    // TODO: , but we should not have to create the team here, we should expect that it exists
    const updatedTeam = await TeamDAO.upsert({
      updated: {
        fk_user_id: user.id,
        team_index: teamIndex,
        camp: team?.camp ?? false,
        bedtime: team?.bedtime ?? '21:30',
        wakeup: team?.wakeup ?? '06:00',
        recipe_type: team?.recipe_type ?? 'curry',
        name: team?.name ?? `Helper team ${teamIndex + 1}`,
        stockpiled_berries: team?.stockpiled_berries ?? '',
        stockpiled_ingredients: team?.stockpiled_ingredients ?? '',
        fk_team_area_id: team?.fk_team_area_id // TODO: if we can live with optional for this then this can be like this
      },
      filter: { fk_user_id: user.id, team_index: teamIndex },
      options: { trx }
    });

    const upsertedMember = await PokemonDAO.upsert({
      updated: {
        external_id: request.externalId,
        fk_user_id: user.id,
        saved: request.saved,
        shiny: request.shiny,
        gender: request.gender,
        pokemon: request.pokemon,
        name: request.name,
        level: request.level,
        ribbon: request.ribbon,
        carry_size: CarrySizeUtils.baseCarrySize(getPokemon(request.pokemon)),
        skill_level: request.skillLevel,
        nature: request.nature,
        subskill_10: PokemonDAO.subskillForLevel(10, request.subskills),
        subskill_25: PokemonDAO.subskillForLevel(25, request.subskills),
        subskill_50: PokemonDAO.subskillForLevel(50, request.subskills),
        subskill_75: PokemonDAO.subskillForLevel(75, request.subskills),
        subskill_100: PokemonDAO.subskillForLevel(100, request.subskills),
        ingredient_0: PokemonDAO.ingredientForLevel(0, request.ingredients),
        ingredient_30: PokemonDAO.ingredientForLevel(30, request.ingredients),
        ingredient_60: PokemonDAO.ingredientForLevel(60, request.ingredients)
      },
      filter: { external_id: request.externalId },
      options: { trx }
    });

    const updatedMemberMeta = await TeamMemberDAO.upsert({
      updated: { fk_pokemon_id: upsertedMember.id, fk_team_id: updatedTeam.id, member_index: memberIndex },
      filter: { fk_team_id: updatedTeam.id, member_index: memberIndex },
      options: { trx }
    });

    return {
      memberIndex: updatedMemberMeta.member_index,
      externalId: upsertedMember.external_id,
      version: upsertedMember.version,
      saved: upsertedMember.saved,
      shiny: upsertedMember.shiny,
      gender: upsertedMember.gender,
      pokemon: upsertedMember.pokemon,
      name: upsertedMember.name,
      level: upsertedMember.level,
      ribbon: upsertedMember.ribbon,
      carrySize: CarrySizeUtils.baseCarrySize(getPokemon(upsertedMember.pokemon)),
      skillLevel: upsertedMember.skill_level,
      nature: upsertedMember.nature,
      subskills: request.subskills,
      ingredients: request.ingredients
    };
  });
}

export async function getTeams(user: DBUser): Promise<GetTeamsResponse> {
  const teams = await TeamDAO.findTeamsWithMembers(user.id);

  return { teams };
}

export async function deleteMember(params: { teamIndex: number; memberIndex: number; user: DBUser }) {
  const { teamIndex, memberIndex, user } = params;

  // update since we need to bump version too
  const teamToUpdate = await TeamDAO.get({ fk_user_id: user.id, team_index: teamIndex });
  const team = await TeamDAO.update(teamToUpdate);

  const teamMember = await TeamMemberDAO.get({ fk_team_id: team.id, member_index: memberIndex });
  await TeamMemberDAO.delete(teamMember);

  const pokemon = await PokemonDAO.get({ id: teamMember.fk_pokemon_id });
  const nrOfTimesInTeams = await TeamMemberDAO.count({ fk_pokemon_id: pokemon.id });
  // if pokemon not saved and this is the only time it is used in a team
  if (!pokemon.saved && nrOfTimesInTeams === 0) {
    await PokemonDAO.delete(pokemon);
  }
}
