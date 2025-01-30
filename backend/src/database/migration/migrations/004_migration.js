function generateFriendCode() {
  const length = 6;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charCount = chars.length;

  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * charCount))).join('');
}

const Tables = Object.freeze({
  User: 'user',
  Notification: 'notification',
  Friend: 'friend'
});

export async function up(knex) {
  await knex.schema.createTable(Tables.Notification, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.timestamps(true, true);

    table.integer('fk_sender_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');
    table.integer('fk_receiver_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');

    table.string('template').notNullable();
  });

  await knex.schema.createTable(Tables.Friend, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.timestamps(true, true);

    table.integer('fk_user1_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');
    table.integer('fk_user2_id').unsigned().notNullable().references('id').inTable(Tables.User).onDelete('CASCADE');
  });

  await knex.schema.alterTable(Tables.User, (table) => {
    table.string('friend_code', 6).unique();
  });

  const users = await knex(Tables.User).select('id');
  const updates = users.map((user) =>
    knex(Tables.User).where('id', user.id).update({
      friend_code: generateFriendCode()
    })
  );

  await Promise.all(updates);
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.User, (table) => {
    table.dropColumn('friend_code');
  });

  await knex.schema.dropTableIfExists(Tables.Friend);
  await knex.schema.dropTableIfExists(Tables.Notification);
}
