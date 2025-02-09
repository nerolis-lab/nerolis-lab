import { describe, expect, it } from 'vitest';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  GREENGRASS_SOYBEANS,
  HONEY,
  MOOMOO_MILK,
  SOOTHING_CACAO,
  WARMING_GINGER
} from '../../domain/ingredient/ingredients';
import { JOLLY, LONELY, MILD, NAUGHTY, QUIET, SASSY } from '../../domain/nature';
import { EEVEE, ESPEON, GOLDUCK, PINSIR, PUPITAR, RAICHU } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  DREAM_SHARD_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SKILL_LEVEL_UP_M,
  SKILL_LEVEL_UP_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
  SLEEP_EXP_BONUS
} from '../../domain/subskill/subskills';
import type { PokemonInstanceWithoutRP } from '../../utils/rp-utils/rp';
import { RP } from '../../utils/rp-utils/rp';
import { uuid } from '../../utils/uuid-utils';

describe('RP', () => {
  it('shall calculate realistic level 50 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: PINSIR,
      name: 'Paris',
      carrySize: 24,
      level: 50,
      ribbon: 0,
      nature: QUIET,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: INGREDIENT_FINDER_S },
        { level: 50, subskill: DREAM_SHARD_BONUS },
        { level: 75, subskill: SKILL_LEVEL_UP_S },
        { level: 100, subskill: SKILL_LEVEL_UP_M }
      ],
      ingredients: [
        { level: 0, ingredient: HONEY, amount: 2 },
        { level: 30, ingredient: FANCY_APPLE, amount: 5 },
        { level: 60, ingredient: HONEY, amount: 7 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.helpFactor).toBe(8.299999999999999);
    expect(rpUtils.miscFactor).toBe(1.22);
    expect(rpUtils.ingredientFactor).toBe(1754.81);
    expect(rpUtils.berryFactor).toBe(398.99);
    expect(rpUtils.skillFactor).toBe(102.91);
    expect(rpUtils.calc()).toBe(2753);
  });

  it('shall calculate realistic level 60 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: ESPEON,
      name: 'Espeon',
      carrySize: 21,
      level: 60,
      ribbon: 0,
      nature: JOLLY,
      skillLevel: 7,
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: SKILL_TRIGGER_M },
        { level: 50, subskill: SKILL_TRIGGER_S }
      ],
      ingredients: [
        { level: 0, ingredient: MOOMOO_MILK, amount: 1 },
        { level: 30, ingredient: SOOTHING_CACAO, amount: 1 },
        { level: 60, ingredient: MOOMOO_MILK, amount: 4 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(5463);
  });

  it('shall calculate realistic ribbon 500 hours Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: PUPITAR,
      name: 'Pupitar',
      carrySize: 18,
      level: 33,
      ribbon: 2,
      nature: MILD,
      skillLevel: 2,
      subskills: [
        { level: 10, subskill: HELPING_BONUS },
        { level: 25, subskill: SKILL_TRIGGER_S }
      ],
      ingredients: [
        { level: 0, ingredient: WARMING_GINGER, amount: 2 },
        { level: 30, ingredient: GREENGRASS_SOYBEANS, amount: 5 },
        { level: 60, ingredient: BEAN_SAUSAGE, amount: 7 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(1350);
  });

  it('shall calculate realistic ribbon 2000 hours Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: EEVEE,
      name: 'Eevee',
      carrySize: 12,
      level: 55,
      ribbon: 4,
      nature: SASSY,
      skillLevel: 6,
      subskills: [
        { level: 10, subskill: HELPING_BONUS },
        { level: 25, subskill: SKILL_TRIGGER_M },
        { level: 50, subskill: HELPING_SPEED_M }
      ],
      ingredients: [
        { level: 0, ingredient: MOOMOO_MILK, amount: 1 },
        { level: 30, ingredient: SOOTHING_CACAO, amount: 1 },
        { level: 60, ingredient: SOOTHING_CACAO, amount: 3 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(4699);
  });

  it('shall calculate level 60 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: PINSIR,
      name: 'Paris',
      carrySize: 24,
      level: 60,
      ribbon: 0,
      nature: QUIET,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: INGREDIENT_FINDER_S },
        { level: 50, subskill: DREAM_SHARD_BONUS },
        { level: 75, subskill: SKILL_LEVEL_UP_S },
        { level: 100, subskill: SKILL_LEVEL_UP_M }
      ],
      ingredients: [
        { level: 0, ingredient: HONEY, amount: 2 },
        { level: 30, ingredient: FANCY_APPLE, amount: 5 },
        { level: 60, ingredient: HONEY, amount: 7 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(4295);
  });

  it('shall calculate skill Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: GOLDUCK,
      name: 'Golduck',
      carrySize: 19,
      level: 38,
      ribbon: 0,
      nature: LONELY,
      skillLevel: 7,
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: SKILL_TRIGGER_M },
        { level: 50, subskill: INVENTORY_L },
        { level: 75, subskill: INGREDIENT_FINDER_S },
        { level: 100, subskill: HELPING_SPEED_S }
      ],
      ingredients: [
        { level: 0, ingredient: SOOTHING_CACAO, amount: 1 },
        { level: 30, ingredient: FANCY_APPLE, amount: 4 },
        { level: 60, ingredient: SOOTHING_CACAO, amount: 4 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3726);
  });

  it('shall calculate berry Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      pokemon: RAICHU,
      name: 'Thor',
      carrySize: 31,
      level: 53,
      ribbon: 0,
      nature: NAUGHTY,
      skillLevel: 4,
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: SLEEP_EXP_BONUS },
        { level: 50, subskill: SKILL_LEVEL_UP_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M }
      ],
      ingredients: [
        { level: 0, ingredient: FANCY_APPLE, amount: 1 },
        { level: 30, ingredient: FANCY_APPLE, amount: 2 },
        { level: 60, ingredient: FANCY_APPLE, amount: 4 }
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
      gender: 'female'
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3555);
  });
});
