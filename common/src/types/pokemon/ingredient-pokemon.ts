import { createIngredientSpecialist } from '../../utils/pokemon-utils/pokemon-constructors';
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
  PLUMP_PUMPKIN,
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

export const BULBASAUR: Pokemon = createIngredientSpecialist({
  name: 'BULBASAUR',
  displayName: 'Bulbasaur',
  pokedexNumber: 1,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 25.7,
  skillPercentage: 1.9,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: HONEY }],
  ingredient30: [
    { amount: 5, ingredient: HONEY },
    { amount: 4, ingredient: SNOOZY_TOMATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: HONEY },
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO }
  ],
  skill: IngredientMagnetS
});

export const IVYSAUR: Pokemon = {
  ...evolvesFrom(BULBASAUR),
  name: 'IVYSAUR',
  displayName: 'Ivysaur',
  pokedexNumber: 2,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 25.5,
  skillPercentage: 1.9,
  carrySize: 14
};

export const VENUSAUR: Pokemon = {
  ...evolvesFrom(IVYSAUR),
  name: 'VENUSAUR',
  displayName: 'Venusaur',
  pokedexNumber: 3,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 26.6,
  skillPercentage: 2.1,
  carrySize: 17
};

export const CHARMANDER: Pokemon = createIngredientSpecialist({
  name: 'CHARMANDER',
  displayName: 'Charmander',
  pokedexNumber: 4,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 1.1,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: BEAN_SAUSAGE }],
  ingredient30: [
    { amount: 5, ingredient: BEAN_SAUSAGE },
    { amount: 4, ingredient: WARMING_GINGER }
  ],
  ingredient60: [
    { amount: 7, ingredient: BEAN_SAUSAGE },
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 6, ingredient: FIERY_HERB }
  ],
  skill: IngredientMagnetS
});

export const CHARMELEON: Pokemon = {
  ...evolvesFrom(CHARMANDER),
  name: 'CHARMELEON',
  displayName: 'Charmeleon',
  pokedexNumber: 5,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.7,
  skillPercentage: 1.6,
  carrySize: 15
};

export const CHARIZARD: Pokemon = {
  ...evolvesFrom(CHARMELEON),
  name: 'CHARIZARD',
  displayName: 'Charizard',
  pokedexNumber: 6,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 22.4,
  skillPercentage: 1.6,
  carrySize: 19
};

export const SQUIRTLE: Pokemon = createIngredientSpecialist({
  name: 'SQUIRTLE',
  displayName: 'Squirtle',
  pokedexNumber: 7,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: MOOMOO_MILK }],
  ingredient30: [
    { amount: 5, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: SOOTHING_CACAO }
  ],
  ingredient60: [
    { amount: 7, ingredient: MOOMOO_MILK },
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 7, ingredient: BEAN_SAUSAGE }
  ],
  skill: IngredientMagnetS
});

export const WARTORTLE: Pokemon = {
  ...evolvesFrom(SQUIRTLE),
  name: 'WARTORTLE',
  displayName: 'Wartortle',
  pokedexNumber: 8,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  carrySize: 14
};

export const BLASTOISE: Pokemon = {
  ...evolvesFrom(WARTORTLE),
  name: 'BLASTOISE',
  displayName: 'Blastoise',
  pokedexNumber: 9,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 27.5,
  skillPercentage: 2.1,
  carrySize: 17
};

export const DIGLETT: Pokemon = createIngredientSpecialist({
  name: 'DIGLETT',
  displayName: 'Diglett',
  pokedexNumber: 50,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 2.1,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 3, ingredient: LARGE_LEEK }
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: LARGE_LEEK },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS }
  ],
  skill: ChargeStrengthS
});

export const DUGTRIO: Pokemon = {
  ...evolvesFrom(DIGLETT),
  name: 'DUGTRIO',
  displayName: 'Dugtrio',
  pokedexNumber: 51,
  frequency: toSeconds(0, 44, 10),
  ingredientPercentage: 19.0,
  skillPercentage: 2.0,
  carrySize: 16
};

export const BELLSPROUT: Pokemon = createIngredientSpecialist({
  name: 'BELLSPROUT',
  displayName: 'Bellsprout',
  pokedexNumber: 69,
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  berry: DURIN,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: LARGE_LEEK }
  ],
  skill: ChargeEnergyS
});

export const WEEPINBELL: Pokemon = {
  ...evolvesFrom(BELLSPROUT),
  name: 'WEEPINBELL',
  displayName: 'Weepinbell',
  pokedexNumber: 70,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 4.0,
  carrySize: 12
};

export const VICTREEBEL: Pokemon = {
  ...evolvesFrom(WEEPINBELL),
  name: 'VICTREEBEL',
  displayName: 'Victreebel',
  pokedexNumber: 71,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  carrySize: 17
};

export const GEODUDE: Pokemon = createIngredientSpecialist({
  name: 'GEODUDE',
  displayName: 'Geodude',
  pokedexNumber: 74,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 28.1,
  skillPercentage: 5.2,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: GREENGRASS_SOYBEANS }],
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: TASTY_MUSHROOM }
  ],
  skill: ChargeStrengthSRange
});

export const GRAVELER: Pokemon = {
  ...evolvesFrom(GEODUDE),
  name: 'GRAVELER',
  displayName: 'Graveler',
  pokedexNumber: 75,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 27.2,
  skillPercentage: 4.8,
  carrySize: 12
};

export const GOLEM: Pokemon = {
  ...evolvesFrom(GRAVELER),
  name: 'GOLEM',
  displayName: 'Golem',
  pokedexNumber: 76,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 28.0,
  skillPercentage: 5.2,
  carrySize: 16
};

export const FARFETCHD: Pokemon = createIngredientSpecialist({
  name: 'FARFETCHD',
  displayName: "Farfetch'd",
  pokedexNumber: 83,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 16,
  skillPercentage: 4.3,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: LARGE_LEEK }],
  ingredient30: [
    { amount: 5, ingredient: LARGE_LEEK },
    { amount: 8, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 7, ingredient: LARGE_LEEK },
    { amount: 13, ingredient: BEAN_SAUSAGE },
    { amount: 12, ingredient: WARMING_GINGER }
  ],
  skill: ChargeStrengthS
});

export const GASTLY: Pokemon = createIngredientSpecialist({
  name: 'GASTLY',
  displayName: 'Gastly',
  pokedexNumber: 92,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 14.4,
  skillPercentage: 1.5,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: FIERY_HERB }],
  ingredient30: [
    { amount: 5, ingredient: FIERY_HERB },
    { amount: 4, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 7, ingredient: FIERY_HERB },
    { amount: 6, ingredient: TASTY_MUSHROOM },
    { amount: 8, ingredient: PURE_OIL }
  ],
  skill: ChargeStrengthSRange
});

export const HAUNTER: Pokemon = {
  ...evolvesFrom(GASTLY),
  name: 'HAUNTER',
  displayName: 'Haunter',
  pokedexNumber: 93,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.7,
  skillPercentage: 2.2,
  carrySize: 14
};

export const GENGAR: Pokemon = {
  ...evolvesFrom(HAUNTER),
  name: 'GENGAR',
  displayName: 'Gengar',
  pokedexNumber: 94,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 16.1,
  skillPercentage: 2.4,
  carrySize: 18
};

export const KANGASKHAN: Pokemon = createIngredientSpecialist({
  name: 'KANGASKHAN',
  displayName: 'Kangaskhan',
  pokedexNumber: 115,
  frequency: toSeconds(0, 44, 10),
  ingredientPercentage: 22.2,
  skillPercentage: 1.7,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: WARMING_GINGER }],
  ingredient30: [
    { amount: 5, ingredient: WARMING_GINGER },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS }
  ],
  skill: IngredientMagnetS
});

export const CHANSEY: Pokemon = createIngredientSpecialist({
  name: 'CHANSEY',
  displayName: 'Chansey',
  pokedexNumber: 113,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 23.6,
  skillPercentage: 2.3,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 15,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: FANCY_EGG }],
  ingredient30: [
    { amount: 5, ingredient: FANCY_EGG },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: FANCY_EGG },
    { amount: 7, ingredient: SOFT_POTATO },
    { amount: 8, ingredient: HONEY }
  ],
  skill: EnergyForEveryone
});

export const MR_MIME: Pokemon = createIngredientSpecialist({
  name: 'MR_MIME',
  displayName: 'Mr. Mime',
  pokedexNumber: 122,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 21.6,
  skillPercentage: 3.9,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: LARGE_LEEK }
  ],
  skill: SkillCopyMimic
});

export const PINSIR: Pokemon = createIngredientSpecialist({
  name: 'PINSIR',
  displayName: 'Pinsir',
  pokedexNumber: 127,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 21.6,
  skillPercentage: 3.1,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 24,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: HONEY }],
  ingredient30: [
    { amount: 5, ingredient: HONEY },
    { amount: 5, ingredient: FANCY_APPLE }
  ],
  ingredient60: [
    { amount: 7, ingredient: HONEY },
    { amount: 8, ingredient: FANCY_APPLE },
    { amount: 7, ingredient: BEAN_SAUSAGE }
  ],
  skill: ChargeStrengthS
});

export const DITTO: Pokemon = createIngredientSpecialist({
  name: 'DITTO',
  displayName: 'Ditto',
  pokedexNumber: 132,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.6,
  berry: PERSIM,
  genders: GENDER_UNKNOWN,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 3, ingredient: LARGE_LEEK }
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 5, ingredient: LARGE_LEEK },
    { amount: 3, ingredient: SLOWPOKE_TAIL }
  ],
  skill: SkillCopyTransform
});

export const DRATINI: Pokemon = createIngredientSpecialist({
  name: 'DRATINI',
  displayName: 'Dratini',
  pokedexNumber: 147,
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 25.0,
  skillPercentage: 2.0,
  berry: YACHE,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: FIERY_HERB }],
  ingredient30: [
    { amount: 5, ingredient: FIERY_HERB },
    { amount: 4, ingredient: GREENGRASS_CORN }
  ],
  ingredient60: [
    { amount: 7, ingredient: FIERY_HERB },
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: PURE_OIL }
  ],
  skill: ChargeEnergyS
});

export const DRAGONAIR: Pokemon = {
  ...evolvesFrom(DRATINI),
  name: 'DRAGONAIR',
  displayName: 'Dragonair',
  pokedexNumber: 148,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 26.2,
  skillPercentage: 2.5,
  carrySize: 12
};

export const DRAGONITE: Pokemon = {
  ...evolvesFrom(DRAGONAIR),
  name: 'DRAGONITE',
  displayName: 'Dragonite',
  pokedexNumber: 149,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 26.4,
  skillPercentage: 2.6,
  carrySize: 20
};

export const WOOPER: Pokemon = createIngredientSpecialist({
  name: 'WOOPER',
  displayName: 'Wooper',
  pokedexNumber: 194,
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.8,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: TASTY_MUSHROOM }],
  ingredient30: [
    { amount: 5, ingredient: TASTY_MUSHROOM },
    { amount: 6, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: TASTY_MUSHROOM },
    { amount: 10, ingredient: SOFT_POTATO },
    { amount: 12, ingredient: BEAN_SAUSAGE }
  ],
  skill: ChargeEnergyS
});

export const WOOPER_PALDEAN: Pokemon = createIngredientSpecialist({
  name: 'WOOPER_PALDEAN',
  displayName: 'Wooper (Paldean Form)',
  pokedexNumber: 194,
  frequency: toSeconds(1, 46, 40),
  ingredientPercentage: 20.9,
  skillPercentage: 5.6,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: SOOTHING_CACAO }],
  ingredient30: [
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 4, ingredient: ROUSING_COFFEE }
  ],
  ingredient60: [
    { amount: 7, ingredient: SOOTHING_CACAO },
    { amount: 7, ingredient: ROUSING_COFFEE },
    { amount: 9, ingredient: SOFT_POTATO }
  ],
  skill: ChargeEnergyS
});

export const QUAGSIRE: Pokemon = {
  ...evolvesFrom(WOOPER),
  name: 'QUAGSIRE',
  displayName: 'Quagsire',
  pokedexNumber: 195,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 19,
  skillPercentage: 3.2,
  carrySize: 16
};

export const DELIBIRD: Pokemon = createIngredientSpecialist({
  name: 'DELIBIRD',
  displayName: 'Delibird',
  pokedexNumber: 225,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 18.8,
  skillPercentage: 1.5,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: FANCY_EGG }],
  ingredient30: [
    { amount: 5, ingredient: FANCY_EGG },
    { amount: 6, ingredient: FANCY_APPLE }
  ],
  ingredient60: [
    { amount: 7, ingredient: FANCY_EGG },
    { amount: 9, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: SOOTHING_CACAO }
  ],
  skill: IngredientMagnetS
});

export const BLISSEY: Pokemon = {
  ...evolvesFrom(CHANSEY),
  name: 'BLISSEY',
  displayName: 'Blissey',
  pokedexNumber: 242,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 23.8,
  skillPercentage: 2.3,
  carrySize: 21
};

export const LARVITAR: Pokemon = createIngredientSpecialist({
  name: 'LARVITAR',
  displayName: 'Larvitar',
  pokedexNumber: 246,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 23.8,
  skillPercentage: 4.1,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: WARMING_GINGER }],
  ingredient30: [
    { amount: 5, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: GREENGRASS_SOYBEANS }
  ],
  ingredient60: [
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS },
    { amount: 8, ingredient: BEAN_SAUSAGE }
  ],
  skill: ChargeEnergyS
});

export const PUPITAR: Pokemon = {
  ...evolvesFrom(LARVITAR),
  name: 'PUPITAR',
  displayName: 'Pupitar',
  pokedexNumber: 247,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 24.7,
  skillPercentage: 4.5,
  carrySize: 13
};

export const TYRANITAR: Pokemon = {
  ...evolvesFrom(PUPITAR),
  name: 'TYRANITAR',
  displayName: 'Tyranitar',
  pokedexNumber: 248,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.6,
  skillPercentage: 5.2,
  berry: WIKI,
  carrySize: 19
};

export const MAWILE: Pokemon = createIngredientSpecialist({
  name: 'MAWILE',
  displayName: 'Mawile',
  pokedexNumber: 303,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 20.4,
  skillPercentage: 3.8,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 4, ingredient: GREENGRASS_CORN }
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 6, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: SNOOZY_TOMATO }
  ],
  skill: IngredientDrawSHyperCutter
});

export const ARON: Pokemon = createIngredientSpecialist({
  name: 'ARON',
  displayName: 'Aron',
  pokedexNumber: 304,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 27.3,
  skillPercentage: 4.6,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: BEAN_SAUSAGE }],
  ingredient30: [
    { amount: 5, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: ROUSING_COFFEE }
  ],
  ingredient60: [
    { amount: 7, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: ROUSING_COFFEE },
    { amount: 7, ingredient: GREENGRASS_SOYBEANS }
  ],
  skill: ChargeEnergyS
});

export const LAIRON: Pokemon = {
  ...evolvesFrom(ARON),
  name: 'LAIRON',
  displayName: 'Lairon',
  pokedexNumber: 305,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 27.7,
  skillPercentage: 4.8,
  carrySize: 13
};

export const AGGRON: Pokemon = {
  ...evolvesFrom(LAIRON),
  name: 'AGGRON',
  displayName: 'Aggron',
  pokedexNumber: 306,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 28.5,
  skillPercentage: 5.2,
  carrySize: 18
};

export const ABSOL: Pokemon = createIngredientSpecialist({
  name: 'ABSOL',
  displayName: 'Absol',
  pokedexNumber: 359,
  frequency: toSeconds(0, 49, 10),
  ingredientPercentage: 17.8,
  skillPercentage: 3.8,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: SOOTHING_CACAO }],
  ingredient30: [
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 8, ingredient: FANCY_APPLE }
  ],
  ingredient60: [
    { amount: 7, ingredient: SOOTHING_CACAO },
    { amount: 12, ingredient: FANCY_APPLE },
    { amount: 7, ingredient: TASTY_MUSHROOM }
  ],
  skill: ChargeStrengthS
});

export const SHINX: Pokemon = createIngredientSpecialist({
  name: 'SHINX',
  displayName: 'Shinx',
  pokedexNumber: 403,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 18.1,
  skillPercentage: 1.8,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: PURE_OIL }
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 7, ingredient: PURE_OIL },
    { amount: 5, ingredient: ROUSING_COFFEE }
  ],
  skill: CookingPowerUpS
});

export const LUXIO: Pokemon = {
  ...evolvesFrom(SHINX),
  name: 'LUXIO',
  displayName: 'Luxio',
  pokedexNumber: 404,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 18.2,
  skillPercentage: 1.8,
  carrySize: 16
};

export const LUXRAY: Pokemon = {
  ...evolvesFrom(LUXIO),
  name: 'LUXRAY',
  displayName: 'Luxray',
  pokedexNumber: 405,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 20,
  skillPercentage: 2.3,
  carrySize: 21
};

export const MIME_JR: Pokemon = {
  ...evolvesInto(MR_MIME),
  name: 'MIME_JR',
  displayName: 'Mime Jr.',
  pokedexNumber: 439,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 3.2,
  carrySize: 7
};

export const HAPPINY: Pokemon = {
  ...evolvesInto(CHANSEY),
  name: 'HAPPINY',
  displayName: 'Happiny',
  pokedexNumber: 440,
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 21,
  skillPercentage: 1.3,
  carrySize: 7
};

export const CROAGUNK: Pokemon = createIngredientSpecialist({
  name: 'CROAGUNK',
  displayName: 'Croagunk',
  pokedexNumber: 453,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.8,
  skillPercentage: 4.2,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 5, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 8, ingredient: BEAN_SAUSAGE }
  ],
  skill: ChargeStrengthS
});

export const TOXICROAK: Pokemon = {
  ...evolvesFrom(CROAGUNK),
  name: 'TOXICROAK',
  displayName: 'Toxicroak',
  pokedexNumber: 454,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 4.3,
  carrySize: 14
};

export const SNOVER: Pokemon = createIngredientSpecialist({
  name: 'SNOVER',
  displayName: 'Snover',
  pokedexNumber: 459,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 25.1,
  skillPercentage: 4.4,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: FANCY_EGG }
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 7, ingredient: FANCY_EGG },
    { amount: 5, ingredient: TASTY_MUSHROOM }
  ],
  skill: ChargeStrengthSRange
});

export const ABOMASNOW: Pokemon = {
  ...evolvesFrom(SNOVER),
  name: 'ABOMASNOW',
  displayName: 'Abomasnow',
  pokedexNumber: 460,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 25.0,
  skillPercentage: 4.4,
  carrySize: 21
};

export const PUMPKABOO_SMALL: Pokemon = createIngredientSpecialist({
  name: 'PUMPKABOO_SMALL',
  displayName: 'Pumpkaboo (Small Variety)',
  pokedexNumber: 710,
  frequency: toSeconds(1, 28, 20),
  ingredientPercentage: 12.0,
  skillPercentage: 4.9,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 7,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: PLUMP_PUMPKIN }],
  ingredient30: [
    { amount: 5, ingredient: PLUMP_PUMPKIN },
    { amount: 11, ingredient: GREENGRASS_SOYBEANS }
  ],
  ingredient60: [
    { amount: 7, ingredient: PLUMP_PUMPKIN },
    { amount: 18, ingredient: GREENGRASS_SOYBEANS },
    { amount: 15, ingredient: SOFT_POTATO }
  ],
  skill: ChargeStrengthS
});

export const PUMPKABOO_MEDIUM: Pokemon = {
  ...PUMPKABOO_SMALL,
  name: 'PUMPKABOO_MEDIUM',
  displayName: 'Pumpkaboo (Medium Variety)',
  frequency: toSeconds(1, 30, 0),
  carrySize: 11
};

export const PUMPKABOO_LARGE: Pokemon = {
  ...PUMPKABOO_SMALL,
  name: 'PUMPKABOO_LARGE',
  displayName: 'Pumpkaboo (Large Variety)',
  frequency: toSeconds(1, 31, 40),
  carrySize: 15
};

export const PUMPKABOO_JUMBO: Pokemon = {
  ...PUMPKABOO_SMALL,
  name: 'PUMPKABOO_JUMBO',
  displayName: 'Pumpkaboo (Jumbo Variety)',
  frequency: toSeconds(1, 33, 20),
  carrySize: 21
};

export const GOURGEIST_SMALL: Pokemon = {
  ...evolvesFrom(PUMPKABOO_SMALL),
  name: 'GOURGEIST_SMALL',
  displayName: 'Gourgeist (Small Variety)',
  pokedexNumber: 711,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 13.0,
  skillPercentage: 4.9,
  carrySize: 10
};

export const GOURGEIST_MEDIUM: Pokemon = {
  ...evolvesFrom(PUMPKABOO_MEDIUM),
  name: 'GOURGEIST_MEDIUM',
  displayName: 'Gourgeist (Medium Variety)',
  pokedexNumber: 711,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 13.0,
  skillPercentage: 4.9,
  carrySize: 14
};

export const GOURGEIST_LARGE: Pokemon = {
  ...evolvesFrom(PUMPKABOO_LARGE),
  name: 'GOURGEIST_LARGE',
  displayName: 'Gourgeist (Large Variety)',
  pokedexNumber: 711,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 13.0,
  skillPercentage: 4.9,
  carrySize: 19
};

export const GOURGEIST_JUMBO: Pokemon = {
  ...evolvesFrom(PUMPKABOO_JUMBO),
  name: 'GOURGEIST_JUMBO',
  displayName: 'Gourgeist (Jumbo Variety)',
  pokedexNumber: 711,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 13.0,
  skillPercentage: 4.9,
  carrySize: 25
};

export const GRUBBIN: Pokemon = createIngredientSpecialist({
  name: 'GRUBBIN',
  displayName: 'Grubbin',
  pokedexNumber: 736,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 15.5,
  skillPercentage: 2.9,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: ROUSING_COFFEE }],
  ingredient30: [
    { amount: 5, ingredient: ROUSING_COFFEE },
    { amount: 4, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 7, ingredient: ROUSING_COFFEE },
    { amount: 7, ingredient: TASTY_MUSHROOM },
    { amount: 11, ingredient: HONEY }
  ],
  skill: ChargeStrengthS
});

export const CHARJABUG: Pokemon = {
  ...evolvesFrom(GRUBBIN),
  name: 'CHARJABUG',
  displayName: 'Charjabug',
  pokedexNumber: 737,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 15.4,
  skillPercentage: 2.8,
  carrySize: 15
};

export const VIKAVOLT: Pokemon = {
  ...evolvesFrom(CHARJABUG),
  name: 'VIKAVOLT',
  displayName: 'Vikavolt',
  pokedexNumber: 738,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.4,
  skillPercentage: 5.1,
  carrySize: 19
};

export const STUFFUL: Pokemon = createIngredientSpecialist({
  name: 'STUFFUL',
  displayName: 'Stufful',
  pokedexNumber: 759,
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 22.5,
  skillPercentage: 1.1,
  berry: CHERI,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 2, ingredient: GREENGRASS_CORN }],
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_CORN },
    { amount: 6, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 10, ingredient: BEAN_SAUSAGE },
    { amount: 9, ingredient: FANCY_EGG }
  ],
  skill: ChargeStrengthSRange
});

export const BEWEAR: Pokemon = {
  ...evolvesFrom(STUFFUL),
  name: 'BEWEAR',
  displayName: 'Bewear',
  pokedexNumber: 760,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 1.3,
  carrySize: 20
};

export const COMFEY: Pokemon = createIngredientSpecialist({
  name: 'COMFEY',
  displayName: 'Comfey',
  pokedexNumber: 764,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 16.7,
  skillPercentage: 3.5,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: GREENGRASS_CORN }],
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_CORN },
    { amount: 6, ingredient: WARMING_GINGER }
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 9, ingredient: WARMING_GINGER },
    { amount: 7, ingredient: SOOTHING_CACAO }
  ],
  skill: EnergizingCheerS
});

export const CRAMORANT: Pokemon = createIngredientSpecialist({
  name: 'CRAMORANT',
  displayName: 'Cramorant',
  pokedexNumber: 845,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 16.5,
  skillPercentage: 3.9,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 2, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 7, ingredient: SOFT_POTATO },
    { amount: 8, ingredient: FANCY_EGG }
  ],
  skill: TastyChanceS
});

export const SPRIGATITO: Pokemon = createIngredientSpecialist({
  name: 'SPRIGATITO',
  displayName: 'Sprigatito',
  pokedexNumber: 906,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 20.8,
  skillPercentage: 2.3,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: SOFT_POTATO }],
  ingredient30: [
    { amount: 5, ingredient: SOFT_POTATO },
    { amount: 6, ingredient: MOOMOO_MILK }
  ],
  ingredient60: [
    { amount: 7, ingredient: SOFT_POTATO },
    { amount: 9, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: WARMING_GINGER }
  ],
  skill: CookingPowerUpS
});

export const FLORAGATO: Pokemon = {
  ...evolvesFrom(SPRIGATITO),
  name: 'FLORAGATO',
  displayName: 'Floragato',
  pokedexNumber: 907,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.9,
  skillPercentage: 2.3,
  carrySize: 14
};

export const MEOWSCARADA: Pokemon = {
  ...evolvesFrom(FLORAGATO),
  name: 'MEOWSCARADA',
  displayName: 'Meowscarada',
  pokedexNumber: 908,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 19,
  skillPercentage: 2.2,
  berry: WIKI,
  carrySize: 18
};

export const FUECOCO: Pokemon = createIngredientSpecialist({
  name: 'FUECOCO',
  displayName: 'Fuecoco',
  pokedexNumber: 909,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 25.4,
  skillPercentage: 5.3,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 5, ingredient: FANCY_APPLE },
    { amount: 4, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 7, ingredient: FANCY_APPLE },
    { amount: 6, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: FIERY_HERB }
  ],
  skill: ChargeEnergyS
});

export const CROCALOR: Pokemon = {
  ...evolvesFrom(FUECOCO),
  name: 'CROCALOR',
  displayName: 'Crocalor',
  pokedexNumber: 910,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 24.7,
  skillPercentage: 5,
  carrySize: 16
};

export const SKELEDIRGE: Pokemon = {
  ...evolvesFrom(CROCALOR),
  name: 'SKELEDIRGE',
  displayName: 'Skeledirge',
  pokedexNumber: 911,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.8,
  skillPercentage: 6.2,
  berry: BLUK,
  carrySize: 19
};

export const QUAXLY: Pokemon = createIngredientSpecialist({
  name: 'QUAXLY',
  displayName: 'Quaxly',
  pokedexNumber: 912,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 26.1,
  skillPercentage: 2.8,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 2, ingredient: GREENGRASS_SOYBEANS }],
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: LARGE_LEEK }
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_SOYBEANS },
    { amount: 4, ingredient: LARGE_LEEK },
    { amount: 6, ingredient: PURE_OIL }
  ],
  skill: ChargeStrengthM
});

export const QUAXWELL: Pokemon = {
  ...evolvesFrom(QUAXLY),
  name: 'QUAXWELL',
  displayName: 'Quaxwell',
  pokedexNumber: 913,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 25.9,
  skillPercentage: 2.7,
  carrySize: 14
};

export const QUAQUAVAL: Pokemon = {
  ...evolvesFrom(QUAXWELL),
  name: 'QUAQUAVAL',
  displayName: 'Quaquaval',
  pokedexNumber: 914,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 23.2,
  skillPercentage: 2.4,
  berry: CHERI,
  carrySize: 19
};

export const CLODSIRE: Pokemon = {
  ...evolvesFrom(WOOPER_PALDEAN),
  name: 'CLODSIRE',
  displayName: 'Clodsire',
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
  GOURGEIST_SMALL,
  GOURGEIST_MEDIUM,
  GOURGEIST_LARGE,
  GOURGEIST_JUMBO,
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
  PUMPKABOO_SMALL,
  PUMPKABOO_MEDIUM,
  PUMPKABOO_LARGE,
  PUMPKABOO_JUMBO,
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
