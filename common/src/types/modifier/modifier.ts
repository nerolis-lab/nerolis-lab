import type { PathValue } from '../type';
import type { ModifierTargetTypeDTO, TargetTypeMap, TypedPath } from './target-types';

export type ModifierOperation = '*' | '+' | '-' | '/' | '=';
export type ConditionOperation = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';

/**
 * Helper type to get the value type for a modifier
 * Generic implementation that works with any type in TargetTypeMap
 *
 * Automatically resolves the correct value type based on:
 * 1. The target type (from TargetTypeMap keys)
 * 2. The property path (direct properties, nested paths, array indices, wildcards)

 *
 * Adding new target types requires no changes to this type - it will
 * automatically work with any new entries added to TargetTypeMap
 */
type ModifierValue<
  TargetType extends ModifierTargetTypeDTO,
  Path extends TypedPath<TargetType>
> = TargetType extends TargetType // Force distribution over union types
  ? PathValue<TargetTypeMap[TargetType], Path> extends never
    ? unknown
    : PathValue<TargetTypeMap[TargetType], Path>
  : unknown;

/**
 * Helper type for condition values - which also needs arrays to support in/not-in operations
 */
type ConditionValue<
  TargetType extends ModifierTargetTypeDTO,
  Path extends TypedPath<TargetType>
> = TargetType extends TargetType // This forces distribution over union types
  ? ModifierValue<TargetType, Path> | ModifierValue<TargetType, Path>[]
  : never;

/**
 * Modifier condition that must be met for the modifier to apply
 * The condition checks if a value at a given path matches the specified criteria
 */
export interface ModifierCondition<
  TargetType extends ModifierTargetTypeDTO = ModifierTargetTypeDTO,
  Path extends TypedPath<TargetType> = TypedPath<TargetType>
> {
  path: Path;
  operation: ConditionOperation;
  value: ConditionValue<TargetType, Path>;
}

/**
 * Type-safe modifier interface with optional conditions
 * Uses distributive conditional types to handle intersection types correctly
 *
 * @example
 * // Modifier that reduces frequency by 10% only for berry specialists
 * const modifier: Modifier<'Pokemon'> = {
 *   path: 'frequency',
 *   operation: '*',
 *   value: 0.9,
 *   condition: {
 *     path: 'specialty',
 *     operation: '=',
 *     value: 'berry'
 *   }
 * };
 */
export interface Modifier<
  TargetType extends ModifierTargetTypeDTO = ModifierTargetTypeDTO,
  Path extends TypedPath<TargetType> = TypedPath<TargetType>
> {
  path: Path;
  operation: ModifierOperation;
  value: ModifierValue<TargetType, Path>;
  condition?: ModifierCondition<TargetType>;
}

// Convenience type aliases for common use cases
export type PokemonPath = TypedPath<'Pokemon'>;
export type PokemonInstancePath = TypedPath<'PokemonInstance'>;

/**
 * Type-safe modifier for Pokemon with proper value type inference
 */
export type PokemonModifier<Path extends PokemonPath = PokemonPath> = {
  path: Path;
  operation: ModifierOperation;
  value: ModifierValue<'Pokemon', Path>;
  condition?: ModifierCondition<'Pokemon'>;
};

/**
 * Type-safe modifier for PokemonInstance with proper value type inference
 */
export type PokemonInstanceModifier<Path extends PokemonInstancePath = PokemonInstancePath> = {
  path: Path;
  operation: ModifierOperation;
  value: ModifierValue<'PokemonInstance', Path>;
  condition?: ModifierCondition<'PokemonInstance'>;
};

export type PokemonCondition = ModifierCondition<'Pokemon'>;
export type PokemonInstanceCondition = ModifierCondition<'PokemonInstance'>;
