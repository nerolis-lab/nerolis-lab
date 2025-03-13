const Tables = Object.freeze({
  UserSettings: 'user_settings'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.integer('pot_size').unsigned().notNullable().defaultTo(15);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.UserSettings, (table) => {
    table.dropColumn('pot_size');
  });
}
