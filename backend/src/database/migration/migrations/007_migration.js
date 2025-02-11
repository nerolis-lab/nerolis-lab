const Tables = Object.freeze({
  UserAreaBonusOld: 'user_area_bonus',
  UserAreaBonus: 'user_area'
});

export async function up(knex) {
  await knex.schema.renameTable(Tables.UserAreaBonusOld, Tables.UserAreaBonus);
}

export async function down(knex) {
  await knex.schema.renameTable(Tables.UserAreaBonus, Tables.UserAreaBonusOld);
}
