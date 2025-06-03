/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  vimic(uuid, 'v4', () => '0'.repeat(36));
});

describe('TeamMemberDAO insert', () => {
  it('shall insert new entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      sneaky_snacking: false
    });
    expect(teamMember).toBeDefined();

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "fk_pokemon_id": 1,
          "fk_team_id": 1,
          "id": 1,
          "member_index": 0,
          "sneaky_snacking": false,
          "version": 1,
        },
      ]
    `);
  });

  it('shall fail to insert entity without fk_team_id', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: undefined as any,
        fk_pokemon_id: 1,
        member_index: 0,
        sneaky_snacking: false
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.fk_team_id/);
  });

  it('shall fail to insert entity without fk_pokemon_id', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: undefined as any,
        member_index: 0,
        sneaky_snacking: false
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.fk_pokemon_id/);
  });

  it('shall fail to insert entity without member_index', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: 1,
        member_index: undefined as any,
        sneaky_snacking: false
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.member_index/);
  });

  it('shall fail to insert entity with duplicate fk_team_id and member_index', async () => {
    await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      sneaky_snacking: false
    });
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: 2,
        member_index: 0,
        sneaky_snacking: false
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: team_member.fk_team_id, team_member.member_index/);
  });
});

describe('TeamMemberDAO update', () => {
  it('shall update entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      sneaky_snacking: false
    });
    expect(teamMember.fk_pokemon_id).toEqual(1);

    await TeamMemberDAO.update({ ...teamMember, fk_pokemon_id: 2 });

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "fk_pokemon_id": 2,
          "fk_team_id": 1,
          "id": 1,
          "member_index": 0,
          "sneaky_snacking": false,
          "version": 2,
        },
      ]
    `);
  });

  it('shall fail to update entity with duplicate fk_team_id and member_index', async () => {
    await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      sneaky_snacking: false
    });
    const teamMemberB = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 2,
      member_index: 1,
      sneaky_snacking: false
    });

    await expect(TeamMemberDAO.update({ ...teamMemberB, member_index: 0 })).rejects.toThrow(
      /SQLITE_CONSTRAINT: UNIQUE constraint failed: team_member.fk_team_id, team_member.member_index/
    );
  });
});

describe('TeamMemberDAO delete', () => {
  it('shall delete entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      sneaky_snacking: false
    });

    await TeamMemberDAO.delete({ id: teamMember.id });

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toEqual([]);
  });
});
