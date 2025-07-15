import type { Berry } from '../../types/berry';
import type { GenderRatio } from '../../types/gender';
import type { Ingredient, IngredientSet } from '../../types/ingredient';
import type { Mainskill } from '../../types/mainskill';
import type { Pokemon, PokemonSpecialty } from '../../types/pokemon';

export function nameFromDisplayName(displayName: string): string {
  return displayName
    .toUpperCase()
    .replace(/\bFORM\b/, '')
    .replace("'", '')
    .replace(/\b\W+\b/, '_')
    .replace(/\W+/, '');
}

export function basePokemon(params: {
  displayName: string;
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
  const {
    displayName,
    pokedexNumber,
    specialty,
    frequency,
    ingredientPercentage,
    skillPercentage,
    berry,
    genders,
    carrySize,
    previousEvolutions,
    remainingEvolutions,
    ingredients,
    skill
  } = params;
  const { ingredient0, ingredient30, ingredient60 } = getIngredientSets(ingredients, specialty);
  return {
    name: nameFromDisplayName(displayName),
    displayName,
    pokedexNumber,
    specialty,
    frequency,
    ingredientPercentage,
    skillPercentage,
    berry,
    genders,
    carrySize,
    previousEvolutions,
    remainingEvolutions,
    ingredient0,
    ingredient30,
    ingredient60,
    skill
  };
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

function isIngredientSetDefinition(ingredients: IngredientSpecification): ingredients is IngredientSetDefinition {
  return (ingredients as IngredientSetDefinition).ingredient0 !== undefined;
}

function getIngredientSets(ingredients: IngredientSpecification, specialty: PokemonSpecialty): IngredientSetDefinition {
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
