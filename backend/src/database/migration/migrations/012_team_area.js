const Tables = {
  Team: 'team',
  TeamArea: 'team_area',
  UserArea: 'user_area'
};

export async function up(knex) {
  await knex.schema.createTable(Tables.TeamArea, (table) => {
    table.increments('id');
    table.integer('fk_user_area_id').unsigned().references('id').inTable(Tables.UserArea).onDelete('CASCADE');
    table.string('island').notNullable();
    table.string('favored_berries').nullable();
    table.string('expert_modifier').nullable();
  });

  await knex.schema.alterTable(Tables.Team, (table) => {
    // TODO: should this be nullable? If not then we're going to need some migration that creates entries for all of them, since a ton of entries exist
    table.integer('fk_team_area_id').unsigned().references('id').inTable(Tables.TeamArea).onDelete('CASCADE');
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
