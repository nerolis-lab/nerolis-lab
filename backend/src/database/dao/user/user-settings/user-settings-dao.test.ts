/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserSettingsDAO } from '@src/database/dao/user/user-settings/user-settings-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MIN_POT_SIZE } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('UserSettingsDAO insert', () => {
  it('shall insert new user settings entity', async () => {
    const userSettings = await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: MIN_POT_SIZE,
      randomize_nicknames: true
    });
    expect(userSettings).toBeDefined();

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: MIN_POT_SIZE,
        version: 1
      })
    ]);
  });

  it('shall insert new user settings entity with custom pot size', async () => {
    const customPotSize = 2000;
    const userSettings = await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: customPotSize,
      randomize_nicknames: true
    });
    expect(userSettings).toBeDefined();

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: customPotSize,
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without fk_user_id', async () => {
    await expect(
      UserSettingsDAO.insert({
        fk_user_id: undefined as any,
        pot_size: MIN_POT_SIZE,
        randomize_nicknames: true
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_settings.fk_user_id/);
  });

  it('shall fail to insert entity without pot_size', async () => {
    await expect(
      UserSettingsDAO.insert({
        fk_user_id: 1,
        pot_size: undefined as any,
        randomize_nicknames: true
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user_settings.pot_size/);
  });
});

describe('UserSettingsDAO update', () => {
  it('shall update user settings entity', async () => {
    const userSettings = await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: MIN_POT_SIZE,
      randomize_nicknames: true
    });
    expect(userSettings.pot_size).toEqual(MIN_POT_SIZE);

    const newPotSize = 3000;
    await UserSettingsDAO.update({
      ...userSettings,
      pot_size: newPotSize
    });

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: newPotSize,
        version: 2
      })
    ]);
  });
});

describe('UserSettingsDAO find', () => {
  it('shall find user settings by fk_user_id', async () => {
    await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: MIN_POT_SIZE,
      randomize_nicknames: true
    });

    await UserSettingsDAO.insert({
      fk_user_id: 2,
      pot_size: 2000,
      randomize_nicknames: true
    });

    const userSettings = await UserSettingsDAO.find({ fk_user_id: 1 });
    expect(userSettings).toEqual(
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: MIN_POT_SIZE,
        version: 1
      })
    );
  });

  it('shall return undefined if no user settings found', async () => {
    const userSettings = await UserSettingsDAO.find({ fk_user_id: 999 });
    expect(userSettings).toBeUndefined();
  });
});

describe('UserSettingsDAO upsert', () => {
  it('shall insert new user settings when they do not exist', async () => {
    await UserSettingsDAO.upsert({
      filter: { fk_user_id: 1 },
      updated: { fk_user_id: 1, pot_size: MIN_POT_SIZE, randomize_nicknames: true }
    });

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: MIN_POT_SIZE,
        version: 1
      })
    ]);
  });

  it('shall update existing user settings when they exist', async () => {
    await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: MIN_POT_SIZE,
      randomize_nicknames: true
    });

    const newPotSize = 3000;
    await UserSettingsDAO.upsert({
      filter: { fk_user_id: 1 },
      updated: { fk_user_id: 1, pot_size: newPotSize, randomize_nicknames: true }
    });

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_user_id: 1,
        pot_size: newPotSize,
        version: 2
      })
    ]);
  });

  it('shall handle multiple user settings for different users', async () => {
    await UserSettingsDAO.upsert({
      filter: { fk_user_id: 1 },
      updated: { fk_user_id: 1, pot_size: MIN_POT_SIZE, randomize_nicknames: true }
    });

    await UserSettingsDAO.upsert({
      filter: { fk_user_id: 2 },
      updated: { fk_user_id: 2, pot_size: 2000, randomize_nicknames: true }
    });

    const data = await UserSettingsDAO.findMultiple();
    expect(data).toHaveLength(2);
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          fk_user_id: 1,
          pot_size: MIN_POT_SIZE,
          version: 1
        }),
        expect.objectContaining({
          id: 2,
          fk_user_id: 2,
          pot_size: 2000,
          version: 1
        })
      ])
    );
  });
});

describe('UserSettingsDAO delete', () => {
  it('shall delete user settings', async () => {
    const userSettings = await UserSettingsDAO.insert({
      fk_user_id: 1,
      pot_size: MIN_POT_SIZE,
      randomize_nicknames: true
    });

    expect(await UserSettingsDAO.findMultiple()).toHaveLength(1);

    await UserSettingsDAO.delete({ id: userSettings.id });

    expect(await UserSettingsDAO.findMultiple()).toHaveLength(0);
  });
});
