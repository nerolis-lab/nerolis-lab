const Tables = Object.freeze({
  TeamMember: 'team_member'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.TeamMember, (table) => {
    table.string('is_sneaky_snacking', 1024).notNullable().defaultTo('false');
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.TeamMember, (table) => {
    table.dropColumn('is_sneaky_snacking');
  });
}
