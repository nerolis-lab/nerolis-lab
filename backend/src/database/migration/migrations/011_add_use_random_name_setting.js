const Tables = {
  UserSettings: 'user_settings'
};

export async function up(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.boolean('randomize_nicknames').notNullable().defaultTo(true);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.dropColumn('randomize_nicknames');
  });
}
