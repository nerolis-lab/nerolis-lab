const Tables = {
  UserSettings: 'user_settings',
};

export async function up(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.boolean('use_random_name').notNullable().defaultTo(true);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.dropColumn('use_random_name');
  });
}
