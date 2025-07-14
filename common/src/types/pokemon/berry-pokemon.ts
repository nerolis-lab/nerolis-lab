import { createBerrySpecialist } from '../../utils/pokemon-utils/pokemon-constructors';
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
import { BALANCED_GENDER, SEVEN_EIGHTHS_MALE, THREE_FOURTHS_FEMALE } from '../gender';
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
  DreamShardMagnetS,
  DreamShardMagnetSRange,
  EnergizingCheerS,
  ExtraHelpfulS,
  IngredientMagnetS,
  Metronome,
  TastyChanceS
} from '../mainskill/mainskills';

import type { Pokemon } from './pokemon';

export const CATERPIE: Pokemon = createBerrySpecialist({
  name: 'CATERPIE',
  displayName: 'Caterpie',
  pokedexNumber: 10,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 17.9,
  skillPercentage: 0.8,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: HONEY,
    b: SNOOZY_TOMATO,
    c: GREENGRASS_SOYBEANS
  },
  skill: IngredientMagnetS
});

export const METAPOD: Pokemon = {
  ...evolvesFrom(CATERPIE),
  name: 'METAPOD',
  displayName: 'Metapod',
  pokedexNumber: 11,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 20.8,
  skillPercentage: 1.8,
  carrySize: 13
};

export const BUTTERFREE: Pokemon = {
  ...evolvesFrom(METAPOD),
  name: 'BUTTERFREE',
  displayName: 'Butterfree',
  pokedexNumber: 12,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 19.7,
  skillPercentage: 1.4,
  carrySize: 21
};

export const RATTATA: Pokemon = createBerrySpecialist({
  name: 'RATTATA',
  displayName: 'Rattata',
  pokedexNumber: 19,
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 23.7,
  skillPercentage: 3.0,
  berry: PERSIM,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_APPLE,
    b: GREENGRASS_SOYBEANS,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const RATICATE: Pokemon = {
  ...evolvesFrom(RATTATA),
  name: 'RATICATE',
  displayName: 'Raticate',
  pokedexNumber: 20,
  frequency: toSeconds(0, 49, 10),
  ingredientPercentage: 23.7,
  skillPercentage: 3.0,
  carrySize: 16
};

export const EKANS: Pokemon = createBerrySpecialist({
  name: 'EKANS',
  displayName: 'Ekans',
  pokedexNumber: 23,
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 3.3,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: FANCY_EGG,
    c: FIERY_HERB
  },
  skill: ChargeEnergyS
});

export const ARBOK: Pokemon = {
  ...evolvesFrom(EKANS),
  name: 'ARBOK',
  displayName: 'Arbok',
  pokedexNumber: 24,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 26.4,
  skillPercentage: 5.7,
  carrySize: 14
};

export const PIKACHU: Pokemon = createBerrySpecialist({
  name: 'PIKACHU',
  displayName: 'Pikachu',
  pokedexNumber: 25,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 20.7,
  skillPercentage: 2.1,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_APPLE,
    b: WARMING_GINGER,
    c: FANCY_EGG
  },
  skill: ChargeStrengthS
});

export const PIKACHU_HALLOWEEN: Pokemon = createBerrySpecialist({
  name: 'PIKACHU_HALLOWEEN',
  displayName: 'Pikachu (Halloween)',
  pokedexNumber: 25,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 21.8,
  skillPercentage: 2.8,
  berry: GREPA,
  genders: BALANCED_GENDER, // unverified for Sleep
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: WARMING_GINGER,
    c: FANCY_EGG
  },
  skill: ChargeStrengthSRange
});

export const RAICHU: Pokemon = {
  ...evolvesFrom(PIKACHU),
  name: 'RAICHU',
  displayName: 'Raichu',
  pokedexNumber: 26,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 22.4,
  skillPercentage: 3.2,
  carrySize: 21
};

export const CLEFAIRY: Pokemon = createBerrySpecialist({
  name: 'CLEFAIRY',
  displayName: 'Clefairy',
  pokedexNumber: 35,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 16.8,
  skillPercentage: 3.6,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 16,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_APPLE,
    b: HONEY,
    c: GREENGRASS_SOYBEANS
  },
  skill: Metronome
});

export const CLEFABLE: Pokemon = {
  ...evolvesFrom(CLEFAIRY),
  name: 'CLEFABLE',
  displayName: 'Clefable',
  pokedexNumber: 36,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 16.8,
  skillPercentage: 3.6,
  carrySize: 24
};

export const VULPIX: Pokemon = createBerrySpecialist({
  name: 'VULPIX',
  displayName: 'Vulpix',
  pokedexNumber: 37,
  frequency: toSeconds(1, 18, 20),
  ingredientPercentage: 16.8,
  skillPercentage: 3.2,
  berry: LEPPA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: GREENGRASS_CORN,
    c: SOFT_POTATO
  },
  skill: EnergizingCheerS
});

export const VULPIX_ALOLAN: Pokemon = createBerrySpecialist({
  name: 'VULPIX_ALOLAN',
  displayName: 'Vulpix (Alolan Form)',
  pokedexNumber: 37,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 23,
  skillPercentage: 2.8,
  berry: RAWST,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: GREENGRASS_CORN,
    c: SOFT_POTATO
  },
  skill: ExtraHelpfulS
});

export const NINETALES: Pokemon = {
  ...evolvesFrom(VULPIX),
  name: 'NINETALES',
  displayName: 'Ninetales',
  pokedexNumber: 38,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 16.4,
  skillPercentage: 2.9,
  carrySize: 23
};

export const NINETALES_ALOLAN: Pokemon = {
  ...evolvesFrom(VULPIX_ALOLAN),
  name: 'NINETALES_ALOLAN',
  displayName: 'Ninetales (Alolan Form)',
  pokedexNumber: 38,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 23.1,
  skillPercentage: 2.8,
  carrySize: 20
};

export const MANKEY: Pokemon = createBerrySpecialist({
  name: 'MANKEY',
  displayName: 'Mankey',
  pokedexNumber: 56,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 19.7,
  skillPercentage: 2.2,
  berry: CHERI,
  genders: BALANCED_GENDER,
  carrySize: 7,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: TASTY_MUSHROOM,
    c: HONEY
  },
  skill: ChargeStrengthSRange
});

export const PRIMEAPE: Pokemon = {
  ...evolvesFrom(MANKEY),
  name: 'PRIMEAPE',
  displayName: 'Primeape',
  pokedexNumber: 57,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 20.0,
  skillPercentage: 2.4,
  carrySize: 17
};

export const DODUO: Pokemon = createBerrySpecialist({
  name: 'DODUO',
  displayName: 'Doduo',
  pokedexNumber: 84,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 18.4,
  skillPercentage: 2.0,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: SOOTHING_CACAO,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const DODRIO: Pokemon = {
  ...evolvesFrom(DODUO),
  name: 'DODRIO',
  displayName: 'Dodrio',
  pokedexNumber: 85,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 18.4,
  skillPercentage: 2.0,
  carrySize: 21
};

export const ONIX: Pokemon = createBerrySpecialist({
  name: 'ONIX',
  displayName: 'Onix',
  pokedexNumber: 95,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 13.2,
  skillPercentage: 2.3,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 22,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: BEAN_SAUSAGE,
    c: SOFT_POTATO
  },
  skill: IngredientMagnetS
});

export const CUBONE: Pokemon = createBerrySpecialist({
  name: 'CUBONE',
  displayName: 'Cubone',
  pokedexNumber: 104,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 22.3,
  skillPercentage: 4.4,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: WARMING_GINGER,
    b: SOOTHING_CACAO
  },
  skill: ChargeEnergyS
});

export const MAROWAK: Pokemon = {
  ...evolvesFrom(CUBONE),
  name: 'MAROWAK',
  displayName: 'Marowak',
  pokedexNumber: 105,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 22.5,
  skillPercentage: 4.5,
  carrySize: 15
};

export const EEVEE_HOLIDAY: Pokemon = createBerrySpecialist({
  name: 'EEVEE_HOLIDAY',
  displayName: 'Eevee (Holiday)',
  pokedexNumber: 133,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 15.6,
  skillPercentage: 3.2,
  berry: PERSIM,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: MOOMOO_MILK,
    b: SOOTHING_CACAO,
    c: BEAN_SAUSAGE
  },
  skill: DreamShardMagnetS
});

export const CHIKORITA: Pokemon = createBerrySpecialist({
  name: 'CHIKORITA',
  displayName: 'Chikorita',
  pokedexNumber: 152,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 16.9,
  skillPercentage: 3.9,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SOOTHING_CACAO,
    b: HONEY,
    c: LARGE_LEEK
  },
  skill: ChargeStrengthSRange
});

export const BAYLEEF: Pokemon = {
  ...evolvesFrom(CHIKORITA),
  name: 'BAYLEEF',
  displayName: 'Bayleef',
  pokedexNumber: 153,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 16.8,
  skillPercentage: 3.8,
  carrySize: 17
};

export const MEGANIUM: Pokemon = {
  ...evolvesFrom(BAYLEEF),
  name: 'MEGANIUM',
  displayName: 'Meganium',
  pokedexNumber: 154,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 17.5,
  skillPercentage: 4.6,
  carrySize: 20
};

export const CYNDAQUIL: Pokemon = createBerrySpecialist({
  name: 'CYNDAQUIL',
  displayName: 'Cyndaquil',
  pokedexNumber: 155,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 18.6,
  skillPercentage: 2.1,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 14,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: WARMING_GINGER,
    b: FIERY_HERB,
    c: PURE_OIL
  },
  skill: ChargeStrengthSRange
});

export const QUILAVA: Pokemon = {
  ...evolvesFrom(CYNDAQUIL),
  name: 'QUILAVA',
  displayName: 'Quilava',
  pokedexNumber: 156,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 21.1,
  skillPercentage: 4.1,
  carrySize: 18
};

export const TYPHLOSION: Pokemon = {
  ...evolvesFrom(QUILAVA),
  name: 'TYPHLOSION',
  displayName: 'Typhlosion',
  pokedexNumber: 157,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 20.8,
  skillPercentage: 3.9,
  carrySize: 23
};

export const TOTODILE: Pokemon = createBerrySpecialist({
  name: 'TOTODILE',
  displayName: 'Totodile',
  pokedexNumber: 158,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 25.3,
  skillPercentage: 5.2,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: PURE_OIL
  },
  skill: ChargeStrengthSRange
});

export const CROCONAW: Pokemon = {
  ...evolvesFrom(TOTODILE),
  name: 'CROCONAW',
  displayName: 'Croconaw',
  pokedexNumber: 159,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 25.3,
  skillPercentage: 5.2,
  carrySize: 15
};

export const FERALIGATR: Pokemon = {
  ...evolvesFrom(CROCONAW),
  name: 'FERALIGATR',
  displayName: 'Feraligatr',
  pokedexNumber: 160,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 25.7,
  skillPercentage: 5.5,
  carrySize: 19
};

export const NATU: Pokemon = createBerrySpecialist({
  name: 'NATU',
  displayName: 'Natu',
  pokedexNumber: 177,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 18.5,
  skillPercentage: 1.6,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_EGG,
    b: SOOTHING_CACAO,
    c: FANCY_APPLE
  },
  skill: IngredientMagnetS
});

export const XATU: Pokemon = {
  ...evolvesFrom(NATU),
  name: 'XATU',
  displayName: 'Xatu',
  pokedexNumber: 178,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 19.1,
  skillPercentage: 2.5,
  carrySize: 19
};

export const PICHU: Pokemon = {
  ...evolvesInto(PIKACHU),
  name: 'PICHU',
  displayName: 'Pichu',
  pokedexNumber: 172,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 21.0,
  skillPercentage: 2.3,
  carrySize: 10
};

export const CLEFFA: Pokemon = {
  ...evolvesInto(CLEFAIRY),
  name: 'CLEFFA',
  displayName: 'Cleffa',
  pokedexNumber: 173,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 16.4,
  skillPercentage: 3.4,
  carrySize: 10
};

export const STEELIX: Pokemon = {
  ...evolvesFrom(ONIX),
  name: 'STEELIX',
  displayName: 'Steelix',
  pokedexNumber: 208,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.4,
  skillPercentage: 3.2,
  berry: BELUE,
  carrySize: 25
};

export const SNEASEL: Pokemon = createBerrySpecialist({
  name: 'SNEASEL',
  displayName: 'Sneasel',
  pokedexNumber: 215,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 25.5,
  skillPercentage: 1.9,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: FANCY_EGG,
    c: GREENGRASS_SOYBEANS
  },
  skill: TastyChanceS
});

export const HOUNDOUR: Pokemon = createBerrySpecialist({
  name: 'HOUNDOUR',
  displayName: 'Houndour',
  pokedexNumber: 228,
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 3.7,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FIERY_HERB,
    b: WARMING_GINGER,
    c: LARGE_LEEK
  },
  skill: ChargeStrengthM
});

export const HOUNDOOM: Pokemon = {
  ...evolvesFrom(HOUNDOUR),
  name: 'HOUNDOOM',
  displayName: 'Houndoom',
  pokedexNumber: 229,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 20.3,
  skillPercentage: 4,
  carrySize: 16
};

export const TORCHIC: Pokemon = createBerrySpecialist({
  name: 'TORCHIC',
  displayName: 'Torchic',
  pokedexNumber: 255,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 16,
  skillPercentage: 4.4,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: TASTY_MUSHROOM,
    b: GREENGRASS_SOYBEANS,
    c: PURE_OIL
  },
  skill: ChargeEnergyS
});

export const COMBUSKEN: Pokemon = {
  ...evolvesFrom(TORCHIC),
  name: 'COMBUSKEN',
  displayName: 'Combusken',
  pokedexNumber: 256,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 17,
  skillPercentage: 5.2,
  carrySize: 16,
  berry: CHERI
};

export const BLAZIKEN: Pokemon = {
  ...evolvesFrom(COMBUSKEN),
  name: 'BLAZIKEN',
  displayName: 'Blaziken',
  pokedexNumber: 257,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.3,
  skillPercentage: 4.9,
  carrySize: 22,
  berry: CHERI
};

export const MUDKIP: Pokemon = createBerrySpecialist({
  name: 'MUDKIP',
  displayName: 'Mudkip',
  pokedexNumber: 258,
  frequency: toSeconds(1, 18, 20),
  ingredientPercentage: 19.2,
  skillPercentage: 2.4,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GREENGRASS_CORN,
    b: MOOMOO_MILK,
    c: TASTY_MUSHROOM
  },
  skill: TastyChanceS
});

export const MARSHTOMP: Pokemon = {
  ...evolvesFrom(MUDKIP),
  name: 'MARSHTOMP',
  displayName: 'Marshtomp',
  pokedexNumber: 259,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 16.8,
  skillPercentage: 2.8,
  carrySize: 16,
  berry: FIGY
};

export const SWAMPERT: Pokemon = {
  ...evolvesFrom(MARSHTOMP),
  name: 'SWAMPERT',
  displayName: 'Swampert',
  pokedexNumber: 260,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 14.6,
  skillPercentage: 3.4,
  carrySize: 20,
  berry: FIGY
};

export const SLAKOTH: Pokemon = createBerrySpecialist({
  name: 'SLAKOTH',
  displayName: 'Slakoth',
  pokedexNumber: 287,
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 21.6,
  skillPercentage: 1.9,
  berry: PERSIM,
  genders: BALANCED_GENDER,
  carrySize: 7,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: HONEY,
    c: FANCY_APPLE
  },
  skill: IngredientMagnetS
});

export const VIGOROTH: Pokemon = {
  ...evolvesFrom(SLAKOTH),
  name: 'VIGOROTH',
  displayName: 'Vigoroth',
  pokedexNumber: 288,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 20.4,
  skillPercentage: 1.5,
  carrySize: 9
};

export const SLAKING: Pokemon = {
  ...evolvesFrom(VIGOROTH),
  name: 'SLAKING',
  displayName: 'Slaking',
  pokedexNumber: 289,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 33.9,
  skillPercentage: 6.7,
  carrySize: 16
};

export const SWABLU: Pokemon = createBerrySpecialist({
  name: 'SWABLU',
  displayName: 'Swablu',
  pokedexNumber: 333,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 17.7,
  skillPercentage: 3.2,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_EGG,
    b: GREENGRASS_SOYBEANS,
    c: FANCY_APPLE
  },
  skill: ChargeEnergyS
});

export const ALTARIA: Pokemon = {
  ...evolvesFrom(SWABLU),
  name: 'ALTARIA',
  displayName: 'Altaria',
  pokedexNumber: 334,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 25.8,
  skillPercentage: 6.1,
  berry: YACHE,
  carrySize: 14
};

export const SHUPPET: Pokemon = createBerrySpecialist({
  name: 'SHUPPET',
  displayName: 'Shuppet',
  pokedexNumber: 353,
  frequency: toSeconds(1, 5, 0),
  ingredientPercentage: 17.1,
  skillPercentage: 2.6,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PURE_OIL,
    b: WARMING_GINGER,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthSRange
});

export const BANETTE: Pokemon = {
  ...evolvesFrom(SHUPPET),
  name: 'BANETTE',
  displayName: 'Banette',
  pokedexNumber: 354,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.9,
  skillPercentage: 3.3,
  carrySize: 19
};

export const SPHEAL: Pokemon = createBerrySpecialist({
  name: 'SPHEAL',
  displayName: 'Spheal',
  pokedexNumber: 363,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.4,
  skillPercentage: 2.3,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: PURE_OIL,
    b: BEAN_SAUSAGE,
    c: WARMING_GINGER
  },
  skill: IngredientMagnetS
});

export const SEALEO: Pokemon = {
  ...evolvesFrom(SPHEAL),
  name: 'SEALEO',
  displayName: 'Sealeo',
  pokedexNumber: 364,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 22.1,
  skillPercentage: 2.1,
  carrySize: 13
};

export const WALREIN: Pokemon = {
  ...evolvesFrom(SEALEO),
  name: 'WALREIN',
  displayName: 'Walrein',
  pokedexNumber: 365,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.3,
  skillPercentage: 2.2,
  carrySize: 18
};

export const WEAVILE: Pokemon = {
  ...evolvesFrom(SNEASEL),
  name: 'WEAVILE',
  displayName: 'Weavile',
  pokedexNumber: 461,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 25.2,
  skillPercentage: 1.8,
  carrySize: 21
};

export const MUNNA: Pokemon = createBerrySpecialist({
  name: 'MUNNA',
  displayName: 'Munna',
  pokedexNumber: 517,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 19.7,
  skillPercentage: 4.3,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: MOOMOO_MILK,
    b: HONEY,
    c: ROUSING_COFFEE
  },
  skill: DreamShardMagnetSRange
});

export const MUSHARNA: Pokemon = {
  ...evolvesFrom(MUNNA),
  name: 'MUSHARNA',
  displayName: 'Musharna',
  pokedexNumber: 518,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 18.8,
  skillPercentage: 4.1,
  carrySize: 24
};

export const OPTIMAL_BERRY_SPECIALISTS: Pokemon[] = [
  BUTTERFREE,
  RATICATE,
  ARBOK,
  PIKACHU_HALLOWEEN,
  RAICHU,
  CLEFABLE,
  NINETALES,
  NINETALES_ALOLAN,
  PRIMEAPE,
  DODRIO,
  ONIX,
  MAROWAK,
  MEGANIUM,
  TYPHLOSION,
  FERALIGATR,
  XATU,
  STEELIX,
  HOUNDOOM,
  BLAZIKEN,
  SWAMPERT,
  VIGOROTH,
  SLAKING,
  ALTARIA,
  BANETTE,
  WALREIN,
  WEAVILE,
  MUSHARNA
];

export const INFERIOR_BERRY_SPECIALISTS: Pokemon[] = [
  CATERPIE,
  METAPOD,
  RATTATA,
  EKANS,
  PIKACHU,
  CLEFAIRY,
  VULPIX,
  VULPIX_ALOLAN,
  MANKEY,
  DODUO,
  CUBONE,
  EEVEE_HOLIDAY,
  CHIKORITA,
  BAYLEEF,
  CYNDAQUIL,
  QUILAVA,
  TOTODILE,
  CROCONAW,
  PICHU,
  CLEFFA,
  NATU,
  SNEASEL,
  HOUNDOUR,
  TORCHIC,
  COMBUSKEN,
  MUDKIP,
  MARSHTOMP,
  SLAKOTH,
  SWABLU,
  SHUPPET,
  SPHEAL,
  SEALEO,
  MUNNA
];

export const ALL_BERRY_SPECIALISTS: Pokemon[] = [...OPTIMAL_BERRY_SPECIALISTS, ...INFERIOR_BERRY_SPECIALISTS];
