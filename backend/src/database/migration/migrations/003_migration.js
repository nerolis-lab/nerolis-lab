const Tables = Object.freeze({
  User: 'user'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('role', 255).notNullable().defaultTo('default');
    table.timestamp('last_login').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.dropColumn('role');
    table.dropColumn('last_login');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
  });
}
