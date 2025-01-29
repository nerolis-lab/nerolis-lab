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

  if (!(await knex.client.config.client.includes('sqlite'))) {
    await knex.raw(`
    CREATE TRIGGER before_insert_user_friend_code
    BEFORE INSERT ON user
    FOR EACH ROW
    BEGIN
      DECLARE random_code VARCHAR(6);
      DECLARE is_unique BOOLEAN;

      SET is_unique = FALSE;

      WHILE NOT is_unique DO
        -- Generate a random 6-character alphanumeric string
        SET random_code = (
          SELECT GROUP_CONCAT(SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(1 + RAND() * 36), 1) SEPARATOR '')
          FROM (
            SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
          ) AS temp
        );

        -- Check if the generated code is unique
        IF NOT EXISTS (SELECT 1 FROM ${Tables.User} WHERE friend_code = random_code) THEN
          SET is_unique = TRUE;
        END IF;
      END WHILE;

      SET NEW.friend_code = random_code;
    END;
  `);
  }
}

export async function down(knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS before_insert_user_friend_code`);
  await knex.schema.dropTableIfExists(Tables.Friend);
  await knex.schema.dropTableIfExists(Tables.Notification);
  await knex.schema.alterTable(Tables.User, (table) => {
    table.dropColumn('friend_code');
  });
}
