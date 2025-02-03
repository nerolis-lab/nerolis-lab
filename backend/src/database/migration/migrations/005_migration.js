const Tables = Object.freeze({
  Team: 'team'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.string('stockpiled_ingredients', 1024);
    table.string('stockpiled_berries', 1024);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('stockpiled_ingredients');
    table.dropColumn('stockpiled_berries');
  });
}
