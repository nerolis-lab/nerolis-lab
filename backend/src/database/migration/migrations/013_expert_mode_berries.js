const Tables = {
  TeamArea: 'team_area'
};

export async function up(knex) {
  const hasMainFavoriteBerry = await knex.schema.hasColumn(Tables.TeamArea, 'main_favorite_berry');

  if (!hasMainFavoriteBerry) {
    await knex.schema.alterTable(Tables.TeamArea, (table) => {
      table.string('main_favorite_berry').nullable();
      table.string('sub_favorite_berries').nullable();
    });
  }
}

export async function down(knex) {
  const hasMainFavoriteBerry = await knex.schema.hasColumn(Tables.TeamArea, 'main_favorite_berry');

  if (hasMainFavoriteBerry) {
    await knex.schema.alterTable(Tables.TeamArea, (table) => {
      table.dropColumn('main_favorite_berry');
      table.dropColumn('sub_favorite_berries');
    });
  }
}
