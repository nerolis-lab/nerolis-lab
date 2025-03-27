import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import {
  deletePokemon,
  getSavedPokemon,
  upsertPokemon
} from '@src/services/user-service/user-pokemon-service/user-pokemon.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MockService } from '@src/utils/test-utils/mock-service.js';
import type { PokemonInstanceWithMeta } from 'sleepapi-common';
import { Roles, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

afterEach(() => {
  MockService.restore();
});

describe('getSavedPokemon', () => {
  it("shall return a user's saved pokemon", async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Existing user',
      role: Roles.Default
    });
    const pkmnSaved = await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });
    await PokemonDAO.insert({ ...basePokemon, saved: false, external_id: 'not saved id', fk_user_id: user.id });

    expect((await getSavedPokemon(user)).map((pkmn) => pkmn.externalId)).toEqual([pkmnSaved.external_id]);
  });
});

describe('upsertPokemon', () => {
  const pokemonInstance: PokemonInstanceWithMeta = {
    carrySize: 0,
    externalId: 'ext id',
    ingredients: [
      { level: 0, name: 'ing0', amount: 2 },
      { level: 30, name: 'ing30', amount: 2 },
      { level: 60, name: 'ing60', amount: 2 }
    ],
    level: 0,
    name: 'name',
    nature: 'nature',
    pokemon: 'pokemon',
    ribbon: 0,
    saved: false,
    shiny: false,
    gender: 'female',
    skillLevel: 0,
    sneakySnacking: false,
    subskills: [],
    version: 0
  };
  it('shall insert pokemon if not exists and saved is true', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
  });

  it('shall update pokemon if pre-exists', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Existing user',
      role: Roles.Default
    });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });
    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });

    const pkmns = await PokemonDAO.findMultiple();
    expect(pkmns).toHaveLength(1);
    expect(pkmns[0].version).toBe(2); // it updated
  });

  it('shall delete pokemon if saved false and does not exist in any teams', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Existing user',
      role: Roles.Default
    });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: false } });

    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
  });
});

describe('deletePokemon', () => {
  it('shall delete specific pokemon for user', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });
    const pkmn = await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);

    await deletePokemon({ user, externalId: pkmn.external_id });

    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
  });

  it('shall not delete if user id matches, but external id doesnt', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Existing user',
      role: Roles.Default
    });
    await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);

    await deletePokemon({ user, externalId: 'incorrect' });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
  });
});

const basePokemon = {
  shiny: false,
  pokemon: 'Pikachu',
  name: 'Sparky',
  skill_level: 5,
  carry_size: 10,
  level: 25,
  ribbon: 0,
  nature: 'Brave',
  subskill_10: 'Thunderbolt',
  subskill_25: 'Quick Attack',
  subskill_50: 'Iron Tail',
  subskill_75: 'Electro Ball',
  subskill_100: 'Thunder',
  ingredient_0: 'Berry',
  ingredient_30: 'Potion',
  ingredient_60: 'Elixir'
};
