import { DatabaseService } from '@src/database/database-service.js';
import DatabaseMigration from '@src/database/migration/database-migration.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { Knex } from 'knex';
import { Roles, uuid } from 'sleepapi-common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { down, up } from './migrations/012_team_area.js';

DaoFixture.init({ recreateDatabasesBeforeEachTest: false });

describe('Migration 012_team_area', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = await DatabaseService.getKnex();

    // First, ensure we're at the latest migration state
    await DatabaseMigration.migrate();

    // Then migrate down to just before migration 012
    // We'll do this by migrating down migration 012 only
    await down(knex);
  });

  beforeEach(async () => {
    // Clean up any existing data
    await knex('team').del();
    await knex('user_area').del();
    await knex('user').del();
  });

  afterEach(async () => {
    // Clean up test data and reset to pre-012 state
    await knex('team').del();
    await knex('team_area')
      .del()
      .catch(() => {}); // May not exist if test failed
    await knex('user_area').del();
    await knex('user').del();

    // Migrate down (imported from 012) to reset for next test
    await down(knex).catch(() => {}); // Ignore error if already down
  });

  afterAll(async () => {
    await DatabaseMigration.migrate();
  });

  it('should migrate team favored_berries to team_area and user_area', async () => {
    // Verify initial state - team_area should not exist yet
    let teamAreaTableExists = await knex.schema.hasTable('team_area');
    expect(teamAreaTableExists).toBe(false);

    // Verify team has favored_berries column before migration
    let hasFavoredBerries = await knex.schema.hasColumn('team', 'favored_berries');
    expect(hasFavoredBerries).toBe(true);

    // Insert test data with old schema
    const [user] = await knex('user').insert({
      name: 'Test User',
      external_id: uuid.v4(),
      friend_code: 'ABC123',
      role: Roles.Default
    });

    // Insert test teams with different berry configurations
    // Can't use TeamDAO or DBTeam since pre-12 schema doesn't match latest
    const testTeams = [
      {
        id: 1,
        fk_user_id: user,
        name: 'Team Cyan',
        favored_berries: 'ORAN,PAMTRE,PECHA',
        version: 1,
        camp: false,
        team_index: 0,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      },
      {
        id: 2,
        fk_user_id: user,
        name: 'Team Taupe',
        favored_berries: 'FIGY,LEPPA,SITRUS',
        version: 1,
        camp: false,
        team_index: 1,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      },
      {
        id: 3,
        fk_user_id: user,
        name: 'Team Greengrass',
        favored_berries: '', // Greengrass teams would have null/empty berries
        version: 1,
        camp: false,
        team_index: 2,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      },
      {
        id: 4,
        fk_user_id: user,
        name: 'Team Null Berries',
        favored_berries: null,
        version: 1,
        camp: false,
        team_index: 3,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      }
    ];

    await knex('team').insert(testTeams);

    // Run the migration up
    await up(knex);

    // Verify team_area table was created
    teamAreaTableExists = await knex.schema.hasTable('team_area');
    expect(teamAreaTableExists).toBe(true);

    // Verify team table structure changed
    hasFavoredBerries = await knex.schema.hasColumn('team', 'favored_berries');
    const hasFkTeamAreaId = await knex.schema.hasColumn('team', 'fk_team_area_id');
    expect(hasFavoredBerries).toBe(false);
    expect(hasFkTeamAreaId).toBe(true);

    // Verify user_area entries were created correctly
    const userAreas = await knex('user_area').select('*').where('fk_user_id', user);
    expect(userAreas).toHaveLength(3); // One for each unique area

    const areaNames = userAreas.map((ua) => ua.area).sort();
    expect(areaNames).toEqual(['cyan', 'greengrass', 'taupe']);

    // Verify team_area entries were created
    const teamAreas = await knex('team_area').select('*');
    expect(teamAreas).toHaveLength(4); // One for each team

    // Verify each team_area has the correct favored_berries
    const teamAreaBerries = teamAreas.map((ta) => ta.favored_berries).sort();
    expect(teamAreaBerries.filter((value) => value === '')).toHaveLength(2); // Empty string and null mapped
    expect(teamAreaBerries).toContain('ORAN,PAMTRE,PECHA');
    expect(teamAreaBerries).toContain('FIGY,LEPPA,SITRUS');

    // Verify teams are linked to team_areas
    const teams = await knex('team').select('*');
    teams.forEach((team) => {
      expect(team.fk_team_area_id).toBeDefined();
      expect(team.fk_team_area_id).toBeGreaterThan(0);
      expect(team.favored_berries).toBeUndefined();
    });
  });

  it('should handle existing user_area entries without duplication', async () => {
    // Insert test data
    const testUserId = 1;
    await knex('user').insert({
      id: testUserId,
      name: 'Test User',
      external_id: uuid.v4(),
      friend_code: 'ABC123',
      role: 'user'
    });

    // Pre-create a user_area entry
    await knex('user_area').insert({
      fk_user_id: testUserId,
      area: 'cyan',
      version: 1,
      bonus: 10
    });

    // Insert teams with same area
    const testTeams = [
      {
        id: 1,
        fk_user_id: testUserId,
        name: 'Team 1',
        favored_berries: 'ORAN,PAMTRE,PECHA',
        version: 1,
        camp: false,
        team_index: 0,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      },
      {
        id: 2,
        fk_user_id: testUserId,
        name: 'Team 2',
        favored_berries: 'ORAN,PAMTRE,PECHA',
        version: 1,
        camp: false,
        team_index: 1,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      }
    ];

    await knex('team').insert(testTeams);

    // Run the migration up
    await up(knex);

    // Verify only one user_area entry exists for cyan
    const userAreas = await knex('user_area').select('*').where('fk_user_id', testUserId).andWhere('area', 'cyan');
    expect(userAreas).toHaveLength(1);
    expect(userAreas[0].bonus).toBe(10); // Original bonus preserved

    // Verify both teams share the same user_area
    const teamAreas = await knex('team_area').select('*');
    expect(teamAreas).toHaveLength(2);
    expect(teamAreas[0].fk_user_area_id).toBe(userAreas[0].id);
    expect(teamAreas[1].fk_user_area_id).toBe(userAreas[0].id);
  });

  it('should properly rollback with down migration', async () => {
    // Insert test data
    const testUserId = 1;
    await knex('user').insert({
      id: testUserId,
      name: 'Test User',
      external_id: uuid.v4(),
      friend_code: 'ABC123',
      role: 'user'
    });

    const testTeam = {
      id: 1,
      fk_user_id: testUserId,
      name: 'Team 1',
      favored_berries: 'ORAN,PAMTRE,PECHA',
      version: 1,
      camp: false,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    };

    await knex('team').insert(testTeam);

    // Run migration up then down
    await up(knex);
    await down(knex);

    // Verify team_area table was dropped
    const teamAreaTableExists = await knex.schema.hasTable('team_area');
    expect(teamAreaTableExists).toBe(false);

    // Verify team table has favored_berries back and no fk_team_area_id
    const hasFavoredBerries = await knex.schema.hasColumn('team', 'favored_berries');
    const hasFkTeamAreaId = await knex.schema.hasColumn('team', 'fk_team_area_id');
    expect(hasFavoredBerries).toBe(true);
    expect(hasFkTeamAreaId).toBe(false);
  });

  it('should handle empty string berry combinations as greengrass', async () => {
    // Insert test data
    const testUserId = 1;
    await knex('user').insert({
      id: testUserId,
      name: 'Test User',
      external_id: uuid.v4(),
      friend_code: 'ABC123',
      role: 'user'
    });

    // Insert team with null berry combination (like greengrass)
    const testTeam = {
      id: 1,
      fk_user_id: testUserId,
      name: 'Team Greengrass',
      favored_berries: '', // Greengrass teams would have null berries
      version: 1,
      camp: false,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    };

    await knex('team').insert(testTeam);

    // Run the migration up
    await up(knex);

    // Verify it was mapped to greengrass
    const userArea = await knex('user_area')
      .select('*')
      .where('fk_user_id', testUserId)
      .andWhere('area', 'greengrass')
      .first();

    expect(userArea).toBeDefined();
    expect(userArea.area).toBe('greengrass');

    const teamArea = await knex('team_area').select('*').first();
    expect(teamArea.favored_berries).toBe(''); // Should preserve the empty string value
    expect(teamArea.fk_user_area_id).toBe(userArea.id);
  });
});
