const Tables = Object.freeze({
  News: 'news',
  User: 'user',
  Notification: 'notification'
});

export async function up(knex) {
  await knex.schema.createTable(Tables.News, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.integer('fk_author_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
  });

  await knex.schema.alterTable(Tables.Notification, (table) => {
    table.integer('vfk_content_id').unsigned();
    table.uuid('external_id').notNullable().unique();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists(Tables.News);

  await knex.schema.alterTable(Tables.Notification, (table) => {
    table.dropColumn('vfk_content_id');
    table.dropColumn('external_id');
  });
}
