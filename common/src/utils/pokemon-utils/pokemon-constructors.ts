import pokemonNames from '../../locales/en/pokemonNames';
import type { Berry } from '../../types/berry';
import type { GenderRatio } from '../../types/gender';
import type { Ingredient, IngredientSet } from '../../types/ingredient';
import type { Mainskill } from '../../types/mainskill';
import type { Pokemon, PokemonSpecialty } from '../../types/pokemon';
import { evolvesFrom, evolvesInto } from './evolution-utils';

export type IngredientDefinition = {
  a: Ingredient;
  b: Ingredient;
  c?: Ingredient;
};

export type IngredientSetDefinition = {
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
};

export type IngredientSpecification = IngredientDefinition | IngredientSetDefinition;

function createPokemon(params: {
  name: keyof typeof pokemonNames;
  pokedexNumber: number;
  specialty: PokemonSpecialty;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredients: IngredientSpecification;
  skill: Mainskill;
}): Pokemon {
  const { ingredients, ...otherParams } = params;
  const { name, specialty } = otherParams;
  const { ingredient0, ingredient30, ingredient60 } = getIngredientSets(ingredients, specialty);
  return {
    ...otherParams,
    displayName: pokemonNames[name],
    // evolution fields get populated when constructing other mons in the evolution line
    evolvesFrom: undefined,
    evolvesInto: [],
    ingredient0,
    ingredient30,
    ingredient60
  };
}

export function createAllSpecialist(params: {
  name: keyof typeof pokemonNames;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredients: IngredientSpecification;
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'all'
  });
}

export function createBerrySpecialist(params: {
  name: keyof typeof pokemonNames;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredients: IngredientSpecification;
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'berry'
  });
}

export function createIngredientSpecialist(params: {
  name: keyof typeof pokemonNames;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredients: IngredientSpecification;
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'ingredient'
  });
}

export function createSkillSpecialist(params: {
  name: keyof typeof pokemonNames;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredients: IngredientSpecification;
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'skill'
  });
}

export function evolvedPokemon(
  previousForm: Pokemon,
  params: Partial<Pokemon> & {
    name: keyof typeof pokemonNames;
    pokedexNumber: number;
    frequency: number;
    ingredientPercentage: number;
    skillPercentage: number;
    carrySize: number;
  }
): Pokemon {
  const evolvedMon: Pokemon = {
    ...evolvesFrom(previousForm),
    ...params,
    displayName: pokemonNames[params.name],
    evolvesFrom: previousForm.name,
    evolvesInto: []
  };
  previousForm.evolvesInto.push(evolvedMon.name);
  return evolvedMon;
}

export function preEvolvedPokemon(
  nextForm: Pokemon,
  params: Partial<Pokemon> & {
    name: keyof typeof pokemonNames;
    pokedexNumber: number;
    frequency: number;
    ingredientPercentage: number;
    skillPercentage: number;
    carrySize: number;
  }
): Pokemon {
  const preEvolvedMon: Pokemon = {
    ...evolvesInto(nextForm),
    ...params,
    displayName: pokemonNames[params.name],
    evolvesFrom: undefined,
    evolvesInto: [nextForm.name]
  };
  nextForm.evolvesFrom = preEvolvedMon.name;
  return preEvolvedMon;
}

export function getIngredientSet(
  ingredientDrop: Ingredient,
  ingredientA: Ingredient,
  level: 0 | 30 | 60,
  specialty: PokemonSpecialty
): IngredientSet {
  const baseStrength = ingredientA.value;
  const levelFactor = level === 0 ? 1 : level === 30 ? 2.25 : 3.6;
  const specialtyFactor = specialty === 'ingredient' || specialty === 'all' ? 2 : 1;
  return {
    amount: Math.round((baseStrength * levelFactor * specialtyFactor) / ingredientDrop.value),
    ingredient: ingredientDrop
  };
}

function isIngredientSetDefinition(ingredients: IngredientSpecification): ingredients is IngredientSetDefinition {
  return (ingredients as IngredientSetDefinition).ingredient0 !== undefined;
}

export function getIngredientSets(
  ingredients: IngredientSpecification,
  specialty: PokemonSpecialty
): IngredientSetDefinition {
  if (isIngredientSetDefinition(ingredients)) {
    return ingredients;
  }
  const { a, b, c } = ingredients;
  const ingredient0 = [getIngredientSet(a, a, 0, specialty)];
  const ingredient30 = [getIngredientSet(a, a, 30, specialty), getIngredientSet(b, a, 30, specialty)];
  const ingredient60 = [getIngredientSet(a, a, 60, specialty), getIngredientSet(b, a, 60, specialty)];
  if (c) {
    ingredient60.push(getIngredientSet(c, a, 60, specialty));
  }
  return {
    ingredient0,
    ingredient30,
    ingredient60
  };
}
