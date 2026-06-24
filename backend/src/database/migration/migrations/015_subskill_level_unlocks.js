const Tables = Object.freeze({
  Pokemon: 'pokemon'
});

export async function up(knex) {
  // Check current state to make migration idempotent
  const hasLevel70Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_70');
  const hasLevel75Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_75');
  const hasLevel80Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_80');
  const hasLevel100Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_100');

  // Add level 70 and 80 columns if they don't exist
  if (!hasLevel70Subskill) {
    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.string('subskill_70', 255);
    });
  }
  if (!hasLevel80Subskill) {
    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.string('subskill_80', 255);
    });
  }

  // Copy over level 75 subskills if they exists, then delete column
  if (hasLevel75Subskill) {
    const existingMons = await knex(Tables.Pokemon).whereNotNull('subskill_75').select('*');
    for (const mon of existingMons) {
      await knex(Tables.Pokemon).where('id', mon.id).update({
        subskill_70: mon.subskill_75
      });
    }

    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.dropColumn('subskill_75');
    });
  }

  // Copy over level 100 subskills if they exists, then delete column
  if (hasLevel100Subskill) {
    const existingMons = await knex(Tables.Pokemon).whereNotNull('subskill_100').select('*');
    for (const mon of existingMons) {
      await knex(Tables.Pokemon).where('id', mon.id).update({
        subskill_80: mon.subskill_100
      });
    }

    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.dropColumn('subskill_100');
    });
  }
}

export async function down(knex) {
  // Check current state to make migration idempotent
  const hasLevel70Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_70');
  const hasLevel75Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_75');
  const hasLevel80Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_80');
  const hasLevel100Subskill = await knex.schema.hasColumn(Tables.Pokemon, 'subskill_100');

  // Add level 75 and 100 columns if they don't exist
  if (!hasLevel75Subskill) {
    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.string('subskill_75', 255);
    });
  }
  if (!hasLevel100Subskill) {
    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.string('subskill_100', 255);
    });
  }

  // Copy over level 70 subskills if they exists, then delete column
  if (hasLevel70Subskill) {
    const existingMons = await knex(Tables.Pokemon).whereNotNull('subskill_70').select('*');
    for (const mon of existingMons) {
      await knex(Tables.Pokemon).where('id', mon.id).update({
        subskill_75: mon.subskill_70
      });
    }

    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.dropColumn('subskill_70');
    });
  }

  // Copy over level 80 subskills if they exists, then delete column
  if (hasLevel80Subskill) {
    const existingMons = await knex(Tables.Pokemon).whereNotNull('subskill_80').select('*');
    for (const mon of existingMons) {
      await knex(Tables.Pokemon).where('id', mon.id).update({
        subskill_100: mon.subskill_80
      });
    }

    await knex.schema.alterTable(Tables.Pokemon, (table) => {
      table.dropColumn('subskill_80');
    });
  }
}
