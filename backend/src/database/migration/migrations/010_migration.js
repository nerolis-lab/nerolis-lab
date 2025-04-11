const Tables = Object.freeze({
  User: 'user'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('discord_id').nullable().unique();
    table.string('patreon_id').nullable().unique();
    table.renameColumn('sub', 'google_id');
  });

  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('google_id').nullable().alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.dropColumn('discord_id');
    table.dropColumn('patreon_id');
    table.renameColumn('google_id', 'sub');
    table.string('sub').notNullable().alter();
  });
}
