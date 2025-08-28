const Tables = {
  Team: 'team',
  TeamArea: 'team_area',
  UserArea: 'user_area'
};

export async function up(knex) {
  await knex.schema.createTable(Tables.TeamArea, (table) => {
    table.increments('id');
    table.integer('version').notNullable().defaultTo(1);
    table.integer('fk_user_area_id').unsigned().references('id').inTable(Tables.UserArea).onDelete('CASCADE');
    table.string('favored_berries').nullable();
    table.string('expert_modifier').nullable();
  });

  await knex.schema.alterTable(Tables.Team, (table) => {
    table.integer('fk_team_area_id').unsigned().references('id').inTable(Tables.TeamArea).onDelete('CASCADE');
  });

  const favoredBerriesToIsland = {
    'ORAN, PAMTRE, PECHA': 'cyan',
    'FIGY, LEPPA, SITRUS': 'taupe',
    'PERSIM, RAWST, WIKI': 'snowdrop',
    'CHERI, DURIN, MAGO': 'lapis',
    'BELUE, BLUK, GREPA': 'powerplant'
  };

  const existingTeams = await knex(Tables.Team).select('*');
  for (const team of existingTeams) {
    const island = favoredBerriesToIsland[team.favored_berries] || 'greengrass';
    let userArea = await knex(Tables.UserArea).where('fk_user_id', team.fk_user_id).andWhere('area', island).first();
    if (!userArea) {
      [userArea] = await knex(Tables.UserArea)
        .insert({
          fk_user_id: team.fk_user_id,
          area: island,
          version: 1,
          bonus: 0
        })
        .returning('*');
    }
    const [teamArea] = await knex(Tables.TeamArea)
      .insert({
        fk_user_area_id: userArea.id,
        favored_berries: team.favored_berries
      })
      .returning('*');
    await knex(Tables.Team).where('id', team.id).update({
      fk_team_area_id: teamArea.id
    });
  }

  // Make fk_team_area_id NOT NULL after populating it
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.integer('fk_team_area_id').unsigned().notNullable().alter();
  });

  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('favored_berries');
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('fk_team_area_id');
    table.string('favored_berries').nullable();
  });

  await knex.schema.dropTable(Tables.TeamArea);
}
