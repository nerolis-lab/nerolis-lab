const Tables = {
  Team: 'team',
  TeamArea: 'team_area',
  UserArea: 'user_area'
};

export async function up(knex) {
  // Check current state to make migration idempotent
  const hasTeamAreaTable = await knex.schema.hasTable(Tables.TeamArea);
  const hasTeamAreaId = await knex.schema.hasColumn(Tables.Team, 'fk_team_area_id');
  const hasFavoredBerries = await knex.schema.hasColumn(Tables.Team, 'favored_berries');

  // Create team_area table if it doesn't exist
  if (!hasTeamAreaTable) {
    await knex.schema.createTable(Tables.TeamArea, (table) => {
      table.increments('id');
      table.integer('version').notNullable().defaultTo(1);
      table
        .integer('fk_user_area_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable(Tables.UserArea)
        .onDelete('CASCADE');
      table.string('favored_berries').notNullable().defaultTo('');
      table.string('expert_modifier').nullable();
    });
  }

  // Add fk_team_area_id column if it doesn't exist
  if (!hasTeamAreaId) {
    await knex.schema.alterTable(Tables.Team, (table) => {
      table
        .integer('fk_team_area_id')
        .unsigned()
        .unique()
        .references('id')
        .inTable(Tables.TeamArea)
        .onDelete('CASCADE');
    });
  }

  // Only migrate data if we still have favored_berries column (haven't migrated yet)
  if (hasFavoredBerries) {
    const favoredBerriesToIsland = {
      'ORAN,PAMTRE,PECHA': 'cyan',
      'FIGY,LEPPA,SITRUS': 'taupe',
      'PERSIM,RAWST,WIKI': 'snowdrop',
      'CHERI,DURIN,MAGO': 'lapis',
      'BELUE,BLUK,GREPA': 'powerplant'
    };

    // Only process teams that don't have fk_team_area_id set
    const existingTeams = await knex(Tables.Team).whereNull('fk_team_area_id').select('*');
    for (const team of existingTeams) {
      const island = favoredBerriesToIsland[team.favored_berries] || 'greengrass';
      let userArea = await knex(Tables.UserArea).where('fk_user_id', team.fk_user_id).andWhere('area', island).first();
      if (!userArea) {
        const [userAreaId] = await knex(Tables.UserArea).insert({
          fk_user_id: team.fk_user_id,
          area: island,
          version: 1,
          bonus: 0
        });
        userArea = await knex(Tables.UserArea).where('id', userAreaId).first();
      }
      const [teamAreaId] = await knex(Tables.TeamArea).insert({
        fk_user_area_id: userArea.id,
        favored_berries: team.favored_berries
      });
      await knex(Tables.Team).where('id', team.id).update({
        fk_team_area_id: teamAreaId
      });
    }

    // Make fk_team_area_id NOT NULL after populating it
    await knex.schema.alterTable(Tables.Team, (table) => {
      table.integer('fk_team_area_id').unsigned().notNullable().alter();
    });

    // Drop favored_berries column after successful migration
    await knex.schema.alterTable(Tables.Team, (table) => {
      table.dropColumn('favored_berries');
    });
  }
}

export async function down(knex) {
  // Check what state we're in
  const hasTeamAreaId = await knex.schema.hasColumn(Tables.Team, 'fk_team_area_id');
  const hasFavoredBerries = await knex.schema.hasColumn(Tables.Team, 'favored_berries');
  const hasTeamAreaTable = await knex.schema.hasTable(Tables.TeamArea);

  // Drop foreign key and column if they exist
  if (hasTeamAreaId) {
    await knex.schema.alterTable(Tables.Team, (table) => {
      table.dropForeign(['fk_team_area_id']);
    });

    await knex.schema.alterTable(Tables.Team, (table) => {
      table.dropColumn('fk_team_area_id');
    });
  }

  // Add favored_berries back if it doesn't exist
  if (!hasFavoredBerries) {
    await knex.schema.alterTable(Tables.Team, (table) => {
      table.string('favored_berries').nullable();
    });
  }

  // Drop team_area table if it exists
  if (hasTeamAreaTable) {
    await knex.schema.dropTable(Tables.TeamArea);
  }
}
