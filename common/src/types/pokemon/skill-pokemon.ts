import { evolvesFrom, evolvesInto } from '../../utils/pokemon-utils/evolution-utils';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
import {
  BELUE,
  BLUK,
  CHERI,
  CHESTO,
  DURIN,
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
  WIKI
} from '../berry/berries';
import {
  BALANCED_GENDER,
  FEMALE_ONLY,
  GENDER_UNKNOWN,
  MALE_ONLY,
  SEVEN_EIGHTHS_MALE,
  THREE_FOURTHS_FEMALE,
  THREE_FOURTHS_MALE
} from '../gender';
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
  BerryBurst,
  BerryBurstDisguise,
  ChargeEnergySMoonlight,
  ChargeStrengthM,
  ChargeStrengthSRange,
  ChargeStrengthSStockpile,
  CookingPowerUpS,
  DreamShardMagnetS,
  DreamShardMagnetSRange,
  EnergizingCheerS,
  EnergyForEveryone,
  EnergyForEveryoneLunarBlessing,
  ExtraHelpfulS,
  HelperBoost,
  IngredientMagnetS,
  Metronome,
  TastyChanceS
} from '../mainskill/mainskills';
import { IngredientDrawSSuperLuck } from '../mainskill/mainskills/ingredient-draw-s-super-luck';

import type { Pokemon } from './pokemon';

export const PIKACHU_HOLIDAY: Pokemon = {
  name: 'PIKACHU_HOLIDAY',
  displayName: 'Pikachu (Holiday)',
  pokedexNumber: 25,
  specialty: 'skill',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.1,
  skillPercentage: 4.2,
  berry: GREPA,
  genders: BALANCED_GENDER, // unverified for Sleep
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: WARMING_GINGER }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 3, ingredient: FANCY_EGG },
    { amount: 3, ingredient: WARMING_GINGER }
  ],
  skill: DreamShardMagnetS
};

export const JIGGLYPUFF: Pokemon = {
  name: 'JIGGLYPUFF',
  displayName: 'Jigglypuff',
  pokedexNumber: 39,
  specialty: 'skill',
  frequency: toSeconds(1, 5, 0),
  ingredientPercentage: 18.2,
  skillPercentage: 4.3,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 9,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: HONEY }],
  ingredient30: [
    { amount: 2, ingredient: HONEY },
    { amount: 2, ingredient: PURE_OIL }
  ],
  ingredient60: [
    { amount: 4, ingredient: HONEY },
    { amount: 3, ingredient: PURE_OIL },
    { amount: 2, ingredient: SOOTHING_CACAO }
  ],
  skill: EnergyForEveryone
};

export const WIGGLYTUFF: Pokemon = {
  ...evolvesFrom(JIGGLYPUFF),
  name: 'WIGGLYTUFF',
  displayName: 'Wigglytuff',
  pokedexNumber: 40,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 17.4,
  skillPercentage: 4.0,
  carrySize: 13
};

export const MEOWTH: Pokemon = {
  name: 'MEOWTH',
  displayName: 'Meowth',
  pokedexNumber: 52,
  specialty: 'skill',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 4.2,
  berry: PERSIM,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: MOOMOO_MILK }],
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: BEAN_SAUSAGE }
  ],
  skill: DreamShardMagnetS
};

export const PERSIAN: Pokemon = {
  ...evolvesFrom(MEOWTH),
  name: 'PERSIAN',
  displayName: 'Persian',
  pokedexNumber: 53,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 16.9,
  skillPercentage: 4.4,
  carrySize: 12
};

export const PSYDUCK: Pokemon = {
  name: 'PSYDUCK',
  displayName: 'Psyduck',
  pokedexNumber: 54,
  specialty: 'skill',
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 13.6,
  skillPercentage: 12.6,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: SOOTHING_CACAO }],
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 4, ingredient: FANCY_APPLE }
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 6, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: BEAN_SAUSAGE }
  ],
  skill: ChargeStrengthSRange
};

export const GOLDUCK: Pokemon = {
  ...evolvesFrom(PSYDUCK),
  name: 'GOLDUCK',
  displayName: 'Golduck',
  pokedexNumber: 55,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.2,
  skillPercentage: 12.5,
  carrySize: 14
};

export const GROWLITHE: Pokemon = {
  name: 'GROWLITHE',
  displayName: 'Growlithe',
  pokedexNumber: 58,
  specialty: 'skill',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 13.8,
  skillPercentage: 5.0,
  berry: LEPPA,
  genders: THREE_FOURTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: FIERY_HERB }],
  ingredient30: [
    { amount: 2, ingredient: FIERY_HERB },
    { amount: 3, ingredient: BEAN_SAUSAGE }
  ],
  ingredient60: [
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 5, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: MOOMOO_MILK }
  ],
  skill: ExtraHelpfulS
};

export const ARCANINE: Pokemon = {
  ...evolvesFrom(GROWLITHE),
  name: 'ARCANINE',
  displayName: 'Arcanine',
  pokedexNumber: 59,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.6,
  skillPercentage: 4.9,
  carrySize: 16
};

export const SLOWPOKE: Pokemon = {
  name: 'SLOWPOKE',
  displayName: 'Slowpoke',
  pokedexNumber: 79,
  specialty: 'skill',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 6.7,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: SOOTHING_CACAO }],
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 1, ingredient: SLOWPOKE_TAIL }
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 2, ingredient: SLOWPOKE_TAIL },
    { amount: 5, ingredient: SNOOZY_TOMATO }
  ],
  skill: EnergizingCheerS
};

export const SLOWBRO: Pokemon = {
  ...evolvesFrom(SLOWPOKE),
  name: 'SLOWBRO',
  displayName: 'Slowbro',
  pokedexNumber: 80,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 19.7,
  skillPercentage: 6.8,
  carrySize: 16
};

export const MAGNEMITE: Pokemon = {
  name: 'MAGNEMITE',
  displayName: 'Magnemite',
  pokedexNumber: 81,
  specialty: 'skill',
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.4,
  berry: BELUE,
  genders: GENDER_UNKNOWN,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: FIERY_HERB }
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 3, ingredient: FIERY_HERB }
  ],
  skill: CookingPowerUpS
};

export const MAGNETON: Pokemon = {
  ...evolvesFrom(MAGNEMITE),
  name: 'MAGNETON',
  displayName: 'Magneton',
  pokedexNumber: 82,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.3,
  carrySize: 11
};

export const EEVEE: Pokemon = {
  name: 'EEVEE',
  displayName: 'Eevee',
  pokedexNumber: 133,
  specialty: 'skill',
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 5.5,
  berry: PERSIM,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: MOOMOO_MILK }],
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO }
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE }
  ],
  skill: IngredientMagnetS
};

export const VAPOREON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'VAPOREON',
  displayName: 'Vaporeon',
  pokedexNumber: 134,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 21.2,
  skillPercentage: 6.1,
  berry: ORAN,
  carrySize: 13,
  skill: IngredientMagnetS
};

export const JOLTEON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'JOLTEON',
  displayName: 'Jolteon',
  pokedexNumber: 135,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 15.1,
  skillPercentage: 3.9,
  berry: GREPA,
  carrySize: 17,
  skill: ExtraHelpfulS
};

export const FLAREON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'FLAREON',
  displayName: 'Flareon',
  pokedexNumber: 136,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 18.5,
  skillPercentage: 5.2,
  berry: LEPPA,
  carrySize: 14,
  skill: CookingPowerUpS
};

export const IGGLYBUFF: Pokemon = {
  ...evolvesInto(JIGGLYPUFF),
  name: 'IGGLYBUFF',
  displayName: 'Igglybuff',
  pokedexNumber: 174,
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 17.0,
  skillPercentage: 3.8,
  carrySize: 8
};

export const TOGEPI: Pokemon = {
  name: 'TOGEPI',
  displayName: 'Togepi',
  pokedexNumber: 175,
  specialty: 'skill',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 4.9,
  berry: PECHA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: FANCY_EGG }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_EGG },
    { amount: 2, ingredient: WARMING_GINGER }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_EGG },
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: SOOTHING_CACAO }
  ],
  skill: Metronome
};

export const TOGETIC: Pokemon = {
  ...evolvesFrom(TOGEPI),
  name: 'TOGETIC',
  displayName: 'Togetic',
  pokedexNumber: 176,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 5.6,
  carrySize: 10
};

export const MAREEP: Pokemon = {
  name: 'MAREEP',
  displayName: 'Mareep',
  pokedexNumber: 179,
  specialty: 'skill',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 12.8,
  skillPercentage: 4.7,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: FIERY_HERB }],
  ingredient30: [
    { amount: 2, ingredient: FIERY_HERB },
    { amount: 3, ingredient: FANCY_EGG }
  ],
  ingredient60: [
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 4, ingredient: FANCY_EGG }
  ],
  skill: ChargeStrengthM
};

export const FLAAFFY: Pokemon = {
  ...evolvesFrom(MAREEP),
  name: 'FLAAFFY',
  displayName: 'Flaaffy',
  pokedexNumber: 180,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 12.7,
  skillPercentage: 4.6,
  carrySize: 11
};

export const AMPHAROS: Pokemon = {
  ...evolvesFrom(FLAAFFY),
  name: 'AMPHAROS',
  displayName: 'Ampharos',
  pokedexNumber: 181,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.0,
  skillPercentage: 4.7,
  carrySize: 15
};

export const SUDOWOODO: Pokemon = {
  name: 'SUDOWOODO',
  displayName: 'Sudowoodo',
  pokedexNumber: 185,
  specialty: 'skill',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 21.7,
  skillPercentage: 7.2,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: SNOOZY_TOMATO }],
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: GREENGRASS_SOYBEANS }
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: TASTY_MUSHROOM }
  ],
  skill: ChargeStrengthM
};

export const ESPEON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'ESPEON',
  displayName: 'Espeon',
  pokedexNumber: 196,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 16.4,
  skillPercentage: 4.4,
  berry: MAGO,
  carrySize: 16,
  skill: ChargeStrengthM
};

export const UMBREON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'UMBREON',
  displayName: 'Umbreon',
  pokedexNumber: 197,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 10.1,
  berry: WIKI,
  carrySize: 14,
  skill: ChargeEnergySMoonlight
};

export const MURKROW: Pokemon = {
  name: 'MURKROW',
  displayName: 'Murkrow',
  pokedexNumber: 198,
  specialty: 'skill',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 14.1,
  skillPercentage: 6.2,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: ROUSING_COFFEE }],
  ingredient30: [
    { amount: 2, ingredient: ROUSING_COFFEE },
    { amount: 3, ingredient: GREENGRASS_SOYBEANS }
  ],
  ingredient60: [
    { amount: 4, ingredient: ROUSING_COFFEE },
    { amount: 6, ingredient: GREENGRASS_SOYBEANS },
    { amount: 4, ingredient: FIERY_HERB }
  ],
  skill: IngredientDrawSSuperLuck
};

export const SLOWKING: Pokemon = {
  ...evolvesFrom(SLOWPOKE),
  name: 'SLOWKING',
  displayName: 'Slowking',
  pokedexNumber: 199,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.6,
  skillPercentage: 7.4,
  carrySize: 17
};

export const WOBBUFFET: Pokemon = {
  name: 'WOBBUFFET',
  displayName: 'Wobbuffet',
  pokedexNumber: 202,
  specialty: 'skill',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21.1,
  skillPercentage: 7,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 3, ingredient: PURE_OIL }
  ],
  skill: EnergizingCheerS
};

export const HERACROSS: Pokemon = {
  name: 'HERACROSS',
  displayName: 'Heracross',
  pokedexNumber: 214,
  specialty: 'skill',
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 15.8,
  skillPercentage: 4.7,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: HONEY }],
  ingredient30: [
    { amount: 2, ingredient: HONEY },
    { amount: 1, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 4, ingredient: HONEY },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 4, ingredient: BEAN_SAUSAGE }
  ],
  skill: IngredientMagnetS
};

export const RAIKOU: Pokemon = {
  name: 'RAIKOU',
  displayName: 'Raikou',
  pokedexNumber: 243,
  specialty: 'skill',
  frequency: toSeconds(0, 35, 0),
  ingredientPercentage: 19.2,
  skillPercentage: 1.9,
  berry: GREPA,
  genders: GENDER_UNKNOWN,
  carrySize: 22,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: BEAN_SAUSAGE }],
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: FIERY_HERB }
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: FIERY_HERB },
    { amount: 2, ingredient: LARGE_LEEK }
  ],
  skill: HelperBoost
};

export const ENTEI: Pokemon = {
  name: 'ENTEI',
  displayName: 'Entei',
  pokedexNumber: 244,
  specialty: 'skill',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 18.7,
  skillPercentage: 2.3,
  berry: LEPPA,
  genders: GENDER_UNKNOWN,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: SNOOZY_TOMATO }
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 3, ingredient: TASTY_MUSHROOM }
  ],
  skill: HelperBoost
};

export const SUICUNE: Pokemon = {
  name: 'SUICUNE',
  displayName: 'Suicune',
  pokedexNumber: 245,
  specialty: 'skill',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 27.7,
  skillPercentage: 2.6,
  berry: ORAN,
  genders: GENDER_UNKNOWN,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: PURE_OIL }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 3, ingredient: PURE_OIL },
    { amount: 2, ingredient: GREENGRASS_CORN }
  ],
  skill: HelperBoost
};

export const TREECKO: Pokemon = {
  name: 'TREECKO',
  displayName: 'Treecko',
  pokedexNumber: 252,
  specialty: 'skill',
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 17.2,
  skillPercentage: 3.5,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: FANCY_EGG }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_EGG },
    { amount: 2, ingredient: ROUSING_COFFEE }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_EGG },
    { amount: 3, ingredient: ROUSING_COFFEE },
    { amount: 2, ingredient: LARGE_LEEK }
  ],
  skill: BerryBurst
};

export const GROVYLE: Pokemon = {
  ...evolvesFrom(TREECKO),
  name: 'GROVYLE',
  displayName: 'Grovyle',
  pokedexNumber: 253,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 15,
  skillPercentage: 3.5,
  carrySize: 11
};

export const SCEPTILE: Pokemon = {
  ...evolvesFrom(GROVYLE),
  name: 'SCEPTILE',
  displayName: 'Sceptile',
  pokedexNumber: 254,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 10.7,
  skillPercentage: 3,
  carrySize: 17
};

export const RALTS: Pokemon = {
  name: 'RALTS',
  displayName: 'Ralts',
  pokedexNumber: 280,
  specialty: 'skill',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 14.5,
  skillPercentage: 4.3,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: GREENGRASS_CORN }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: GREENGRASS_CORN },
    { amount: 2, ingredient: LARGE_LEEK }
  ],
  skill: EnergyForEveryone
};

export const KIRLIA: Pokemon = {
  ...evolvesFrom(RALTS),
  name: 'KIRLIA',
  displayName: 'Kirlia',
  pokedexNumber: 281,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 14.6,
  skillPercentage: 4.3,
  carrySize: 13
};

export const GARDEVOIR: Pokemon = {
  ...evolvesFrom(KIRLIA),
  name: 'GARDEVOIR',
  displayName: 'Gardevoir',
  pokedexNumber: 282,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.4,
  skillPercentage: 4.2,
  carrySize: 18
};

export const SABLEYE: Pokemon = {
  name: 'SABLEYE',
  displayName: 'Sableye',
  pokedexNumber: 302,
  specialty: 'skill',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 18.8,
  skillPercentage: 6.8,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 3, ingredient: TASTY_MUSHROOM },
    { amount: 3, ingredient: SOOTHING_CACAO }
  ],
  skill: DreamShardMagnetSRange
};

export const GULPIN: Pokemon = {
  name: 'GULPIN',
  displayName: 'Gulpin',
  pokedexNumber: 316,
  specialty: 'skill',
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 21.4,
  skillPercentage: 6.3,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: GREENGRASS_SOYBEANS }],
  ingredient30: [
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
    { amount: 1, ingredient: TASTY_MUSHROOM }
  ],
  ingredient60: [
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 4, ingredient: HONEY }
  ],
  skill: DreamShardMagnetSRange
};

export const SWALOT: Pokemon = {
  ...evolvesFrom(GULPIN),
  name: 'SWALOT',
  displayName: 'Swalot',
  pokedexNumber: 317,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21,
  skillPercentage: 7,
  carrySize: 19
};

export const WYNAUT: Pokemon = {
  ...evolvesInto(WOBBUFFET),
  name: 'WYNAUT',
  displayName: 'Wynaut',
  pokedexNumber: 360,
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 21.3,
  skillPercentage: 5.9,
  carrySize: 7
};

export const BONSLY: Pokemon = {
  ...evolvesInto(SUDOWOODO),
  name: 'BONSLY',
  displayName: 'Bonsly',
  pokedexNumber: 438,
  frequency: toSeconds(1, 45, 0),
  ingredientPercentage: 18.9,
  skillPercentage: 6.1,
  carrySize: 8
};

export const DRIFLOON: Pokemon = {
  name: 'DRIFLOON',
  displayName: 'Drifloon',
  pokedexNumber: 425,
  specialty: 'skill',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 13.7,
  skillPercentage: 6.9,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: GREENGRASS_CORN }],
  ingredient30: [
    { amount: 2, ingredient: GREENGRASS_CORN },
    { amount: 3, ingredient: PURE_OIL }
  ],
  ingredient60: [
    { amount: 4, ingredient: GREENGRASS_CORN },
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  skill: ChargeStrengthSStockpile
};
export const DRIFBLIM: Pokemon = {
  ...evolvesFrom(DRIFLOON),
  name: 'DRIFBLIM',
  displayName: 'Drifblim',
  pokedexNumber: 426,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 12.8,
  skillPercentage: 6.1,
  carrySize: 17
};

export const HONCHKROW: Pokemon = {
  ...evolvesFrom(MURKROW),
  name: 'HONCHKROW',
  displayName: 'Honchkrow',
  pokedexNumber: 430,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 14.3,
  skillPercentage: 6.7,
  carrySize: 18
};

export const RIOLU: Pokemon = {
  name: 'RIOLU',
  displayName: 'Riolu',
  pokedexNumber: 447,
  specialty: 'skill',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 12.6,
  skillPercentage: 3.8,
  berry: CHERI,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: PURE_OIL }],
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: SOFT_POTATO }
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: FANCY_EGG }
  ],
  skill: DreamShardMagnetS
};

export const LUCARIO: Pokemon = {
  ...evolvesFrom(RIOLU),
  name: 'LUCARIO',
  displayName: 'Lucario',
  pokedexNumber: 448,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.0,
  skillPercentage: 5.1,
  carrySize: 14
};

export const MAGNEZONE: Pokemon = {
  ...evolvesFrom(MAGNETON),
  name: 'MAGNEZONE',
  displayName: 'Magnezone',
  pokedexNumber: 462,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 17.9,
  skillPercentage: 6.2,
  carrySize: 13
};

export const TOGEKISS: Pokemon = {
  ...evolvesFrom(TOGETIC),
  name: 'TOGEKISS',
  displayName: 'Togekiss',
  pokedexNumber: 468,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.8,
  skillPercentage: 5.3,
  carrySize: 16
};

export const LEAFEON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'LEAFEON',
  displayName: 'Leafeon',
  pokedexNumber: 470,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 20.5,
  skillPercentage: 5.9,
  berry: DURIN,
  carrySize: 13,
  skill: EnergizingCheerS
};

export const GLACEON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'GLACEON',
  displayName: 'Glaceon',
  pokedexNumber: 471,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 6.3,
  berry: RAWST,
  carrySize: 12,
  skill: CookingPowerUpS
};

export const GALLADE: Pokemon = {
  ...evolvesFrom(KIRLIA),
  name: 'GALLADE',
  displayName: 'Gallade',
  pokedexNumber: 475,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.7,
  skillPercentage: 5.4,
  carrySize: 19,
  berry: CHERI,
  genders: MALE_ONLY,
  skill: ExtraHelpfulS
};

export const CRESSELIA: Pokemon = {
  name: 'CRESSELIA',
  displayName: 'Cresselia',
  pokedexNumber: 488,
  specialty: 'skill',
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 23.9,
  skillPercentage: 4.1,
  berry: MAGO,
  genders: FEMALE_ONLY,
  carrySize: 22,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: WARMING_GINGER }],
  ingredient30: [
    { amount: 2, ingredient: WARMING_GINGER },
    { amount: 2, ingredient: SOOTHING_CACAO }
  ],
  ingredient60: [
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: SOOTHING_CACAO },
    { amount: 4, ingredient: SNOOZY_TOMATO }
  ],
  skill: EnergyForEveryoneLunarBlessing
};

export const RUFFLET: Pokemon = {
  name: 'RUFFLET',
  displayName: 'Rufflet',
  pokedexNumber: 627,
  specialty: 'skill',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 12.5,
  skillPercentage: 3.1,
  berry: PAMTRE,
  genders: MALE_ONLY,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredient0: [{ amount: 1, ingredient: BEAN_SAUSAGE }],
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: GREENGRASS_CORN }
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: GREENGRASS_CORN },
    { amount: 2, ingredient: ROUSING_COFFEE }
  ],
  skill: BerryBurst
};

export const BRAVIARY: Pokemon = {
  ...evolvesFrom(RUFFLET),
  name: 'BRAVIARY',
  displayName: 'Braviary',
  pokedexNumber: 628,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 12.1,
  skillPercentage: 3.2,
  carrySize: 18
};

export const SYLVEON: Pokemon = {
  ...evolvesFrom(EEVEE),
  name: 'SYLVEON',
  displayName: 'Sylveon',
  pokedexNumber: 700,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.8,
  skillPercentage: 4.0,
  berry: PECHA,
  carrySize: 15,
  skill: EnergyForEveryone
};

export const DEDENNE: Pokemon = {
  name: 'DEDENNE',
  displayName: 'Dedenne',
  pokedexNumber: 702,
  specialty: 'skill',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 17.7,
  skillPercentage: 4.5,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: SOOTHING_CACAO }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 2, ingredient: GREENGRASS_CORN }
  ],
  skill: TastyChanceS
};

export const MIMIKYU: Pokemon = {
  name: 'MIMIKYU',
  displayName: 'Mimikyu',
  pokedexNumber: 778,
  specialty: 'skill',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 15.3,
  skillPercentage: 3.3,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: [{ amount: 1, ingredient: FANCY_APPLE }],
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: ROUSING_COFFEE }
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: ROUSING_COFFEE },
    { amount: 2, ingredient: TASTY_MUSHROOM }
  ],
  skill: BerryBurstDisguise
};

export const PAWMI: Pokemon = {
  name: 'PAWMI',
  displayName: 'Pawmi',
  pokedexNumber: 921,
  specialty: 'skill',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 11.1,
  skillPercentage: 3.6,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredient0: [{ amount: 1, ingredient: SOOTHING_CACAO }],
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: MOOMOO_MILK }
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 6, ingredient: MOOMOO_MILK },
    { amount: 5, ingredient: FANCY_EGG }
  ],
  skill: EnergyForEveryone
};

export const PAWMO: Pokemon = {
  ...evolvesFrom(PAWMI),
  name: 'PAWMO',
  displayName: 'Pawmo',
  pokedexNumber: 922,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 10.9,
  skillPercentage: 3.6,
  carrySize: 12
};

export const PAWMOT: Pokemon = {
  ...evolvesFrom(PAWMO),
  name: 'PAWMOT',
  displayName: 'Pawmot',
  pokedexNumber: 923,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.1,
  skillPercentage: 3.9,
  carrySize: 18
};

export const OPTIMAL_SKILL_SPECIALISTS: Pokemon[] = [
  WIGGLYTUFF,
  PERSIAN,
  GOLDUCK,
  ARCANINE,
  SLOWBRO,
  VAPOREON,
  JOLTEON,
  FLAREON,
  AMPHAROS,
  SUDOWOODO,
  ESPEON,
  UMBREON,
  SLOWKING,
  WOBBUFFET,
  HERACROSS,
  RAIKOU,
  ENTEI,
  SUICUNE,
  SCEPTILE,
  GARDEVOIR,
  SABLEYE,
  SWALOT,
  DRIFBLIM,
  HONCHKROW,
  LUCARIO,
  MAGNEZONE,
  TOGEKISS,
  LEAFEON,
  GLACEON,
  GALLADE,
  CRESSELIA,
  BRAVIARY,
  SYLVEON,
  DEDENNE,
  MIMIKYU,
  PAWMOT
];

export const INFERIOR_SKILL_SPECIALISTS: Pokemon[] = [
  PIKACHU_HOLIDAY,
  JIGGLYPUFF,
  MEOWTH,
  PSYDUCK,
  GROWLITHE,
  SLOWPOKE,
  MAGNEMITE,
  MAGNETON,
  EEVEE,
  IGGLYBUFF,
  TOGEPI,
  TOGETIC,
  MAREEP,
  FLAAFFY,
  MURKROW,
  TREECKO,
  GROVYLE,
  RALTS,
  KIRLIA,
  GULPIN,
  WYNAUT,
  BONSLY,
  DRIFLOON,
  RIOLU,
  RUFFLET,
  PAWMI,
  PAWMO
];

export const ALL_SKILL_SPECIALISTS: Pokemon[] = [...OPTIMAL_SKILL_SPECIALISTS, ...INFERIOR_SKILL_SPECIALISTS];
