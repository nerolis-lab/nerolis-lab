import { describe, expect, it } from 'vitest';
import { MAX_POKEMON_LEVEL } from '../../types/constants';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  GREENGRASS_SOYBEANS,
  HONEY,
  MOOMOO_MILK,
  ROUSING_COFFEE,
  SOOTHING_CACAO,
  WARMING_GINGER
} from '../../types/ingredient/ingredients';
import { ADAMANT, BASHFUL, CAREFUL, HARDY, JOLLY, LONELY, MILD, NAUGHTY, QUIET, SASSY } from '../../types/nature';
import {
  CRESSELIA,
  EEVEE,
  ESPEON,
  GOLDUCK,
  HONCHKROW,
  PINSIR,
  PUPITAR,
  RAICHU,
  TOGEKISS,
  UMBREON
} from '../../types/pokemon';
import {
  BERRY_FINDING_S,
  DREAM_SHARD_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  SKILL_LEVEL_UP_M,
  SKILL_LEVEL_UP_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
  SLEEP_EXP_BONUS
} from '../../types/subskill/subskills';
import type { PokemonInstanceWithoutRP } from '../../utils/rp-utils/rp';
import { RP } from '../../utils/rp-utils/rp';
import { uuid } from '../../utils/uuid-utils';
import { mockPokemon } from '../../vitest/mocks';

const baseInstance: PokemonInstanceWithoutRP = {
  pokemon: mockPokemon(),
  name: mockPokemon().name,
  level: 0,
  ribbon: 0,
  nature: BASHFUL,
  skillLevel: 0,
  subskills: [],
  ingredients: [],
  externalId: uuid.v4(),
  version: 0,
  saved: false,
  shiny: false,
  gender: undefined,
  sneakySnacking: false
};

describe('RP', () => {
  it('shall have ingGrowth entries for all levels up to MAX_POKEMON_LEVEL', () => {
    for (let i = 1; i <= MAX_POKEMON_LEVEL; i++) {
      expect(RP.ingGrowth).toHaveProperty(i.toString());
    }
  });

  it('shall NOT have an ingGrowth entry for MAX_POKEMON_LEVEL + 1', () => {
    expect(RP.ingGrowth).not.toHaveProperty((MAX_POKEMON_LEVEL + 1).toString());
  });

  it('shall calculate realistic level 50 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: PINSIR,
      name: 'Paris',
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.helpFactor).toBe(8.299999999999999);
    expect(rpUtils.miscFactor).toBe(1.22);
    expect(rpUtils.ingredientFactor).toBe(1754.81);
    expect(rpUtils.berryFactor).toBe(398.99);
    expect(rpUtils.skillFactor).toBe(102.92);
    expect(rpUtils.calc()).toBe(2753);
  });

  it('shall calculate realistic level 60 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: ESPEON,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(5463);
  });

  it('shall calculate realistic ribbon 500 hours Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: PUPITAR,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(1350);
  });

  it('shall calculate realistic ribbon 2000 hours Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: EEVEE,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(4699);
  });

  it('shall calculate level 60 Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: PINSIR,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(4295);
  });

  it('shall calculate skill Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: GOLDUCK,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3726);
  });

  it('shall calculate berry Pokémon', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: RAICHU,
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
      ]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3555);
  });

  it('edge case 1', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: HONCHKROW,
      level: 26,
      ribbon: 0,
      nature: ADAMANT,
      skillLevel: 2,
      subskills: [
        { level: 10, subskill: HELPING_SPEED_M },
        { level: 25, subskill: HELPING_BONUS }
      ],
      ingredients: [{ level: 0, ingredient: ROUSING_COFFEE, amount: 1 }]
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(1441);
  });

  it('edge case 2', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: CRESSELIA,
      level: 52,
      ribbon: 4,
      nature: SASSY,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: HELPING_SPEED_M },
        { level: 25, subskill: BERRY_FINDING_S },
        { level: 50, subskill: INVENTORY_M }
      ],
      ingredients: [
        { level: 0, ingredient: WARMING_GINGER, amount: 1 },
        { level: 30, ingredient: SOOTHING_CACAO, amount: 2 }
      ]
    };

    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3319);
  });

  it('edge case 3', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: CRESSELIA,
      level: 52,
      ribbon: 0,
      nature: BASHFUL,
      skillLevel: 1,
      subskills: [],
      ingredients: [
        { level: 0, ingredient: WARMING_GINGER, amount: 1 },
        { level: 30, ingredient: WARMING_GINGER, amount: 2 }
      ]
    };

    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(1675);
  });

  it('edge case 4', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: TOGEKISS,
      level: 40,
      ribbon: 0,
      nature: CAREFUL,
      skillLevel: 3,
      subskills: [
        { level: 10, subskill: SKILL_LEVEL_UP_S },
        { level: 25, subskill: INVENTORY_L }
      ],
      ingredients: [
        { level: 0, ingredient: FANCY_EGG, amount: 1 },
        { level: 30, ingredient: WARMING_GINGER, amount: 2 }
      ]
    };

    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(1761);
  });

  it('edge case 5', () => {
    const pokemonInstance: PokemonInstanceWithoutRP = {
      ...baseInstance,
      pokemon: UMBREON,
      level: 30,
      ribbon: 0,
      nature: HARDY,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_S }
      ],
      ingredients: [
        { level: 0, ingredient: MOOMOO_MILK, amount: 1 },
        { level: 30, ingredient: MOOMOO_MILK, amount: 2 }
      ]
    };

    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(998);
  });
});
