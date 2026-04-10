const Tables = {
  TeamMember: 'team_member'
};

export async function up(knex) {
  // Check current state to make migration idempotent
  const hasSneakySnacking = await knex.schema.hasColumn(Tables.TeamMember, 'sneaky_snacking');

  // Add sneaky_snacking column if it doesn't exist
  if (!hasSneakySnacking) {
    await knex.schema.alterTable(Tables.TeamMember, (table) => {
      table.boolean('sneaky_snacking');
    });
  }
}

export async function down(knex) {
  // Check what state we're in
  const hasSneakySnacking = await knex.schema.hasColumn(Tables.TeamMember, 'sneaky_snacking');

  // Drop column if it exists
  if (hasSneakySnacking) {
    await knex.schema.alterTable(Tables.TeamMember, (table) => {
      table.dropColumn('sneaky_snacking');
    });
  }
}
