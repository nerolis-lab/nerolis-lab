const Tables = Object.freeze({
  User: 'user'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('discord_id').nullable().unique();
  });

  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('sub').nullable().alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.dropColumn('discord_id');
    table.string('sub').notNullable().alter();
  });
}
