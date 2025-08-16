import type { PokemonInstance } from '../instance';
import type { Pokemon } from '../pokemon';
import type { PathKeys } from '../type';

export type ModifierTargetTypeDTO = 'Pokemon' | 'PokemonInstance';
export type ModifierTargetType = Pokemon | PokemonInstance;

/**
 * Used for mapping API strings to actual types
 *
 * @tutorial How to add a new target type
 * 1. Add the string literal to ModifierTargetTypeDTO union above
 * 2. Add the actual type to ModifierTargetType union above
 * 3. Add the mapping entry here
 *
 * Example for adding a new "Item" type:
 * - ModifierTargetTypeDTO = 'Pokemon' | 'PokemonInstance' | 'Item'
 * - ModifierTargetType = Pokemon | PokemonInstance | Item
 * - TargetTypeMap = { Pokemon: Pokemon, PokemonInstance: PokemonInstance, Item: Item }
 *
 * The ModifierValue type will automatically work with the new type!
 */
export type TargetTypeMap = {
  Pokemon: Pokemon;
  PokemonInstance: PokemonInstance;
};

/**
 * @returns a path to a property of any provided eligible modifier target type. Supports nested attributes.
 */
export type TypedPath<T extends ModifierTargetTypeDTO> = PathKeys<TargetTypeMap[T]>;
