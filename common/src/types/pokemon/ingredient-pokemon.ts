import { basePokemon } from '../../utils/pokemon-utils/pokemon-constructors';
import { evolvesFrom, evolvesInto } from '../../utils/pokemon-utils/evolution-utils';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
import {
  BELUE,
  BLUK,
  CHERI,
  CHESTO,
  DURIN,
  FIGY,
  GREPA,
  LEPPA,
  LUM,
  MAGO,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
  YACHE
} from '../berry/berries';
import { BALANCED_GENDER, FEMALE_ONLY, GENDER_UNKNOWN, SEVEN_EIGHTHS_MALE, THREE_FOURTHS_FEMALE } from '../gender';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  MOOMOO_MILK,
  PURE_OIL,
  ROUSING_COFFEE,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER
} from '../ingredient/ingredients';
import {
  ChargeEnergyS,
  ChargeStrengthM,
  ChargeStrengthS,
  ChargeStrengthSRange,
  CookingPowerUpS,
  EnergizingCheerS,
  EnergyForEveryone,
  IngredientDrawSHyperCutter,
  IngredientMagnetS,
  SkillCopyMimic,
  SkillCopyTransform,
  TastyChanceS
} from '../mainskill/mainskills';

import type { Pokemon } from './pokemon';

export const BULBASAUR: Pokemon = basePokemon({
  displayName: 'Bulbasaur',
  pokedexNumber: 1,
  specialty: 'ingredient',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 25.7,
  skillPercentage: 1.9,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: HONEY,
    b: SNOOZY_TOMATO,
    c: SOFT_POTATO
  },
  skill: IngredientMagnetS
});

export const IVYSAUR: Pokemon = {
  ...evolvesFrom(BULBASAUR, 'Ivysaur'),
  pokedexNumber: 2,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 25.5,
  skillPercentage: 1.9,
  carrySize: 14
};

export const VENUSAUR: Pokemon = {
  ...evolvesFrom(IVYSAUR, 'Venusaur'),
  pokedexNumber: 3,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 26.6,
  skillPercentage: 2.1,
  carrySize: 17
};

export const CHARMANDER: Pokemon = basePokemon({
  displayName: 'Charmander',
  pokedexNumber: 4,
  specialty: 'ingredient',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 1.1,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: WARMING_GINGER,
    c: FIERY_HERB
  },
  skill: IngredientMagnetS
});

export const CHARMELEON: Pokemon = {
  ...evolvesFrom(CHARMANDER, 'Charmeleon'),
  pokedexNumber: 5,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.7,
  skillPercentage: 1.6,
  carrySize: 15
};

export const CHARIZARD: Pokemon = {
  ...evolvesFrom(CHARMELEON, 'Charizard'),
  pokedexNumber: 6,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 22.4,
  skillPercentage: 1.6,
  carrySize: 19
};

export const SQUIRTLE: Pokemon = basePokemon({
  displayName: 'Squirtle',
  pokedexNumber: 7,
  specialty: 'ingredient',
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: MOOMOO_MILK,
    b: SOOTHING_CACAO,
    c: BEAN_SAUSAGE
  },
  skill: IngredientMagnetS
});

export const WARTORTLE: Pokemon = {
  ...evolvesFrom(SQUIRTLE, 'Wartortle'),
  pokedexNumber: 8,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  carrySize: 14
};

export const BLASTOISE: Pokemon = {
  ...evolvesFrom(WARTORTLE, 'Blastoise'),
  pokedexNumber: 9,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 27.5,
  skillPercentage: 2.1,
  carrySize: 17
};

export const DIGLETT: Pokemon = basePokemon({
  displayName: 'Diglett',
  pokedexNumber: 50,
  specialty: 'ingredient',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 2.1,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: LARGE_LEEK,
    c: GREENGRASS_SOYBEANS
  },
  skill: ChargeStrengthS
});

export const DUGTRIO: Pokemon = {
  ...evolvesFrom(DIGLETT, 'Dugtrio'),
  pokedexNumber: 51,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.0,
  skillPercentage: 2.0,
  carrySize: 16
};

export const BELLSPROUT: Pokemon = basePokemon({
  displayName: 'Bellsprout',
  pokedexNumber: 69,
  specialty: 'ingredient',
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  berry: DURIN,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: SOFT_POTATO,
    c: LARGE_LEEK
  },
  skill: ChargeEnergyS
});

export const WEEPINBELL: Pokemon = {
  ...evolvesFrom(BELLSPROUT, 'Weepinbell'),
  pokedexNumber: 70,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 4.0,
  carrySize: 12
};

export const VICTREEBEL: Pokemon = {
  ...evolvesFrom(WEEPINBELL, 'Victreebel'),
  pokedexNumber: 71,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  carrySize: 17
};

export const GEODUDE: Pokemon = basePokemon({
  displayName: 'Geodude',
  pokedexNumber: 74,
  specialty: 'ingredient',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 28.1,
  skillPercentage: 5.2,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: SOFT_POTATO,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthSRange
});

export const GRAVELER: Pokemon = {
  ...evolvesFrom(GEODUDE, 'Graveler'),
  pokedexNumber: 75,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 27.2,
  skillPercentage: 4.8,
  carrySize: 12
};

export const GOLEM: Pokemon = {
  ...evolvesFrom(GRAVELER, 'Golem'),
  pokedexNumber: 76,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 28.0,
  skillPercentage: 5.2,
  carrySize: 16
};

export const FARFETCHD: Pokemon = basePokemon({
  displayName: "Farfetch'd",
  pokedexNumber: 83,
  specialty: 'ingredient',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 16,
  skillPercentage: 4.3,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: LARGE_LEEK,
    b: BEAN_SAUSAGE,
    c: WARMING_GINGER
  },
  skill: ChargeStrengthS
});

export const GASTLY: Pokemon = basePokemon({
  displayName: 'Gastly',
  pokedexNumber: 92,
  specialty: 'ingredient',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 14.4,
  skillPercentage: 1.5,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: TASTY_MUSHROOM,
    c: PURE_OIL
  },
  skill: ChargeStrengthSRange
});

export const HAUNTER: Pokemon = {
  ...evolvesFrom(GASTLY, 'Haunter'),
  pokedexNumber: 93,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.7,
  skillPercentage: 2.2,
  carrySize: 14
};

export const GENGAR: Pokemon = {
  ...evolvesFrom(HAUNTER, 'Gengar'),
  pokedexNumber: 94,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 16.1,
  skillPercentage: 2.4,
  carrySize: 18
};

export const KANGASKHAN: Pokemon = basePokemon({
  displayName: 'Kangaskhan',
  pokedexNumber: 115,
  specialty: 'ingredient',
  frequency: toSeconds(0, 44, 10),
  ingredientPercentage: 22.2,
  skillPercentage: 1.7,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: WARMING_GINGER,
    b: SOFT_POTATO,
    c: GREENGRASS_SOYBEANS
  },
  skill: IngredientMagnetS
});

export const CHANSEY: Pokemon = basePokemon({
  displayName: 'Chansey',
  pokedexNumber: 113,
  specialty: 'ingredient',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 23.6,
  skillPercentage: 2.3,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 15,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_EGG,
    b: SOFT_POTATO,
    c: HONEY
  },
  skill: EnergyForEveryone
});

export const MR_MIME: Pokemon = basePokemon({
  displayName: 'Mr. Mime',
  pokedexNumber: 122,
  specialty: 'ingredient',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 21.6,
  skillPercentage: 3.9,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: SOFT_POTATO,
    c: LARGE_LEEK
  },
  skill: SkillCopyMimic
});

export const PINSIR: Pokemon = basePokemon({
  displayName: 'Pinsir',
  pokedexNumber: 127,
  specialty: 'ingredient',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 21.6,
  skillPercentage: 3.1,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 24,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: HONEY,
    b: FANCY_APPLE,
    c: BEAN_SAUSAGE
  },
  skill: ChargeStrengthS
});

export const DITTO: Pokemon = basePokemon({
  displayName: 'Ditto',
  pokedexNumber: 132,
  specialty: 'ingredient',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.6,
  berry: PERSIM,
  genders: GENDER_UNKNOWN,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: LARGE_LEEK,
    c: SLOWPOKE_TAIL
  },
  skill: SkillCopyTransform
});

export const DRATINI: Pokemon = basePokemon({
  displayName: 'Dratini',
  pokedexNumber: 147,
  specialty: 'ingredient',
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 25.0,
  skillPercentage: 2.0,
  berry: YACHE,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: GREENGRASS_CORN,
    c: PURE_OIL
  },
  skill: ChargeEnergyS
});

export const DRAGONAIR: Pokemon = {
  ...evolvesFrom(DRATINI, 'Dragonair'),
  pokedexNumber: 148,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 26.2,
  skillPercentage: 2.5,
  carrySize: 12
};

export const DRAGONITE: Pokemon = {
  ...evolvesFrom(DRAGONAIR, 'Dragonite'),
  pokedexNumber: 149,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 26.4,
  skillPercentage: 2.6,
  carrySize: 20
};

export const WOOPER: Pokemon = basePokemon({
  displayName: 'Wooper',
  pokedexNumber: 194,
  specialty: 'ingredient',
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.8,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: TASTY_MUSHROOM,
    b: SOFT_POTATO,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const WOOPER_PALDEAN: Pokemon = basePokemon({
  displayName: 'Wooper (Paldean Form)',
  pokedexNumber: 194,
  specialty: 'ingredient',
  frequency: toSeconds(1, 46, 40),
  ingredientPercentage: 20.9,
  skillPercentage: 5.6,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SOOTHING_CACAO,
    b: ROUSING_COFFEE,
    c: SOFT_POTATO
  },
  skill: ChargeEnergyS
});

export const QUAGSIRE: Pokemon = {
  ...evolvesFrom(WOOPER, 'Quagsire'),
  pokedexNumber: 195,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 19,
  skillPercentage: 3.2,
  carrySize: 16
};

export const DELIBIRD: Pokemon = basePokemon({
  displayName: 'Delibird',
  pokedexNumber: 225,
  specialty: 'ingredient',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 18.8,
  skillPercentage: 1.5,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_EGG,
    b: FANCY_APPLE,
    c: SOOTHING_CACAO
  },
  skill: IngredientMagnetS
});

export const BLISSEY: Pokemon = {
  ...evolvesFrom(CHANSEY, 'Blissey'),
  pokedexNumber: 242,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 23.8,
  skillPercentage: 2.3,
  carrySize: 21
};

export const LARVITAR: Pokemon = basePokemon({
  displayName: 'Larvitar',
  pokedexNumber: 246,
  specialty: 'ingredient',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 23.8,
  skillPercentage: 4.1,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: WARMING_GINGER,
    b: GREENGRASS_SOYBEANS,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const PUPITAR: Pokemon = {
  ...evolvesFrom(LARVITAR, 'Pupitar'),
  pokedexNumber: 247,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 24.7,
  skillPercentage: 4.5,
  carrySize: 13
};

export const TYRANITAR: Pokemon = {
  ...evolvesFrom(PUPITAR, 'Tyranitar'),
  pokedexNumber: 248,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.6,
  skillPercentage: 5.2,
  berry: WIKI,
  carrySize: 19
};

export const MAWILE: Pokemon = basePokemon({
  displayName: 'Mawile',
  pokedexNumber: 303,
  specialty: 'ingredient',
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 20.4,
  skillPercentage: 3.8,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: GREENGRASS_CORN,
    c: SNOOZY_TOMATO
  },
  skill: IngredientDrawSHyperCutter
});

export const ARON: Pokemon = basePokemon({
  displayName: 'Aron',
  pokedexNumber: 304,
  specialty: 'ingredient',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 27.3,
  skillPercentage: 4.6,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: ROUSING_COFFEE,
    c: GREENGRASS_SOYBEANS
  },
  skill: ChargeEnergyS
});

export const LAIRON: Pokemon = {
  ...evolvesFrom(ARON, 'Lairon'),
  pokedexNumber: 305,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 27.7,
  skillPercentage: 4.8,
  carrySize: 13
};

export const AGGRON: Pokemon = {
  ...evolvesFrom(LAIRON, 'Aggron'),
  pokedexNumber: 306,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 28.5,
  skillPercentage: 5.2,
  carrySize: 18
};

export const ABSOL: Pokemon = basePokemon({
  displayName: 'Absol',
  pokedexNumber: 359,
  specialty: 'ingredient',
  frequency: toSeconds(0, 49, 10),
  ingredientPercentage: 17.8,
  skillPercentage: 3.8,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: SOOTHING_CACAO,
    b: FANCY_APPLE,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthS
});

export const SHINX: Pokemon = basePokemon({
  displayName: 'Shinx',
  pokedexNumber: 403,
  specialty: 'ingredient',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 18.1,
  skillPercentage: 1.8,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: PURE_OIL,
    c: ROUSING_COFFEE
  },
  skill: CookingPowerUpS
});

export const LUXIO: Pokemon = {
  ...evolvesFrom(SHINX, 'Luxio'),
  pokedexNumber: 404,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 18.2,
  skillPercentage: 1.8,
  carrySize: 16
};

export const LUXRAY: Pokemon = {
  ...evolvesFrom(LUXIO, 'Luxray'),
  pokedexNumber: 405,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 20,
  skillPercentage: 2.3,
  carrySize: 21
};

export const MIME_JR: Pokemon = {
  ...evolvesInto(MR_MIME, 'Mime Jr.'),
  pokedexNumber: 439,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 3.2,
  carrySize: 7
};

export const HAPPINY: Pokemon = {
  ...evolvesInto(CHANSEY, 'Happiny'),
  pokedexNumber: 440,
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 21,
  skillPercentage: 1.3,
  carrySize: 7
};

export const CROAGUNK: Pokemon = basePokemon({
  displayName: 'Croagunk',
  pokedexNumber: 453,
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.8,
  skillPercentage: 4.2,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PURE_OIL,
    b: BEAN_SAUSAGE
  },
  skill: ChargeStrengthS
});

export const TOXICROAK: Pokemon = {
  ...evolvesFrom(CROAGUNK, 'Toxicroak'),
  pokedexNumber: 454,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 4.3,
  carrySize: 14
};

export const SNOVER: Pokemon = basePokemon({
  displayName: 'Snover',
  pokedexNumber: 459,
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 25.1,
  skillPercentage: 4.4,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: FANCY_EGG,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthSRange
});

export const ABOMASNOW: Pokemon = {
  ...evolvesFrom(SNOVER, 'Abomasnow'),
  pokedexNumber: 460,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 25.0,
  skillPercentage: 4.4,
  carrySize: 21
};

export const GRUBBIN: Pokemon = basePokemon({
  displayName: 'Grubbin',
  pokedexNumber: 736,
  specialty: 'ingredient',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 15.5,
  skillPercentage: 2.9,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: ROUSING_COFFEE,
    b: TASTY_MUSHROOM,
    c: HONEY
  },
  skill: ChargeStrengthS
});

export const CHARJABUG: Pokemon = {
  ...evolvesFrom(GRUBBIN, 'Charjabug'),
  pokedexNumber: 737,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 15.4,
  skillPercentage: 2.8,
  carrySize: 15
};

export const VIKAVOLT: Pokemon = {
  ...evolvesFrom(CHARJABUG, 'Vikavolt'),
  pokedexNumber: 738,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.4,
  skillPercentage: 5.1,
  carrySize: 19
};

export const STUFFUL: Pokemon = basePokemon({
  displayName: 'Stufful',
  pokedexNumber: 759,
  specialty: 'ingredient',
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 22.5,
  skillPercentage: 1.1,
  berry: CHERI,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_CORN,
    b: BEAN_SAUSAGE,
    c: FANCY_EGG
  },
  skill: ChargeStrengthSRange
});

export const BEWEAR: Pokemon = {
  ...evolvesFrom(STUFFUL, 'Bewear'),
  pokedexNumber: 760,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 1.3,
  carrySize: 20
};

export const COMFEY: Pokemon = basePokemon({
  displayName: 'Comfey',
  pokedexNumber: 764,
  specialty: 'ingredient',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 16.7,
  skillPercentage: 3,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: GREENGRASS_CORN,
    b: WARMING_GINGER,
    c: SOOTHING_CACAO
  },
  skill: EnergizingCheerS
});

export const CRAMORANT: Pokemon = basePokemon({
  displayName: 'Cramorant',
  pokedexNumber: 845,
  specialty: 'ingredient',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 16.5,
  skillPercentage: 3.9,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: SOFT_POTATO,
    c: FANCY_EGG
  },
  skill: TastyChanceS
});

export const SPRIGATITO: Pokemon = basePokemon({
  displayName: 'Sprigatito',
  pokedexNumber: 906,
  specialty: 'ingredient',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 20.8,
  skillPercentage: 2.3,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SOFT_POTATO,
    b: MOOMOO_MILK,
    c: WARMING_GINGER
  },
  skill: CookingPowerUpS
});

export const FLORAGATO: Pokemon = {
  ...evolvesFrom(SPRIGATITO, 'Floragato'),
  pokedexNumber: 907,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.9,
  skillPercentage: 2.3,
  carrySize: 14
};

export const MEOWSCARADA: Pokemon = {
  ...evolvesFrom(FLORAGATO, 'Meowscarada'),
  pokedexNumber: 908,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 19,
  skillPercentage: 2.2,
  berry: WIKI,
  carrySize: 18
};

export const FUECOCO: Pokemon = basePokemon({
  displayName: 'Fuecoco',
  pokedexNumber: 909,
  specialty: 'ingredient',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 25.4,
  skillPercentage: 5.3,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FANCY_APPLE,
    b: BEAN_SAUSAGE,
    c: FIERY_HERB
  },
  skill: ChargeEnergyS
});

export const CROCALOR: Pokemon = {
  ...evolvesFrom(FUECOCO, 'Crocalor'),
  pokedexNumber: 910,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 24.7,
  skillPercentage: 5,
  carrySize: 16
};

export const SKELEDIRGE: Pokemon = {
  ...evolvesFrom(CROCALOR, 'Skeledirge'),
  pokedexNumber: 911,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.8,
  skillPercentage: 6.2,
  berry: BLUK,
  carrySize: 19
};

export const QUAXLY: Pokemon = basePokemon({
  displayName: 'Quaxly',
  pokedexNumber: 912,
  specialty: 'ingredient',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 26.1,
  skillPercentage: 2.8,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: LARGE_LEEK,
    c: PURE_OIL
  },
  skill: ChargeStrengthM
});

export const QUAXWELL: Pokemon = {
  ...evolvesFrom(QUAXLY, 'Quaxwell'),
  pokedexNumber: 913,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 25.9,
  skillPercentage: 2.7,
  carrySize: 14
};

export const QUAQUAVAL: Pokemon = {
  ...evolvesFrom(QUAXWELL, 'Quaquaval'),
  pokedexNumber: 914,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 23.2,
  skillPercentage: 2.4,
  berry: CHERI,
  carrySize: 19
};

export const CLODSIRE: Pokemon = {
  ...evolvesFrom(WOOPER_PALDEAN, 'Clodsire'),
  pokedexNumber: 980,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.8,
  skillPercentage: 5.5,
  carrySize: 20
};

export const OPTIMAL_INGREDIENT_SPECIALISTS: Pokemon[] = [
  VENUSAUR,
  CHARIZARD,
  BLASTOISE,
  DUGTRIO,
  VICTREEBEL,
  GOLEM,
  FARFETCHD,
  GENGAR,
  KANGASKHAN,
  MR_MIME,
  PINSIR,
  DITTO,
  DRAGONITE,
  QUAGSIRE,
  DELIBIRD,
  BLISSEY,
  PUPITAR,
  TYRANITAR,
  MAWILE,
  AGGRON,
  ABSOL,
  LUXRAY,
  TOXICROAK,
  ABOMASNOW,
  VIKAVOLT,
  BEWEAR,
  COMFEY,
  CRAMORANT,
  FLORAGATO,
  MEOWSCARADA,
  CROCALOR,
  SKELEDIRGE,
  QUAXWELL,
  QUAQUAVAL,
  CLODSIRE
];

export const INFERIOR_INGREDIENT_SPECIALISTS: Pokemon[] = [
  BULBASAUR,
  IVYSAUR,
  CHARMANDER,
  CHARMELEON,
  SQUIRTLE,
  WARTORTLE,
  DIGLETT,
  BELLSPROUT,
  WEEPINBELL,
  GEODUDE,
  GRAVELER,
  GASTLY,
  HAUNTER,
  CHANSEY,
  DRATINI,
  DRAGONAIR,
  WOOPER,
  WOOPER_PALDEAN,
  LARVITAR,
  ARON,
  LAIRON,
  SHINX,
  LUXIO,
  MIME_JR,
  HAPPINY,
  CROAGUNK,
  SNOVER,
  GRUBBIN,
  CHARJABUG,
  STUFFUL,
  SPRIGATITO,
  FUECOCO,
  QUAXLY
];

export const ALL_INGREDIENT_SPECIALISTS: Pokemon[] = [
  ...OPTIMAL_INGREDIENT_SPECIALISTS,
  ...INFERIOR_INGREDIENT_SPECIALISTS
];
