const Tables = Object.freeze({
  User: 'user',
  UserRecipe: 'user_recipe',
  UserAreaBonus: 'user_area_bonus'
});

export async function up(knex) {
  await knex.schema.createTable(Tables.UserRecipe, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.integer('fk_user_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');

    table.string('recipe', 255).notNullable();
    table.integer('level').notNullable();
  });

  await knex.schema.createTable(Tables.UserAreaBonus, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.integer('fk_user_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');

    table.string('area', 255).notNullable();
    table.integer('bonus').notNullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists(Tables.UserRecipe);
}
