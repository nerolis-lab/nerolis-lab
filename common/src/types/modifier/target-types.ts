import type { PokemonInstanceExt } from '../instance';
import type { MemberStrength, TeamMemberExt } from '../team';

export type ModifierTargetTypeDTO = 'PokemonInstance' | 'MemberStrength' | 'TeamMember';
export type ModifierTargetType = PokemonInstanceExt | MemberStrength | TeamMemberExt;

/**
 * Used for mapping API strings to actual types
 *
 * @tutorial How to add a new target type
 * 1. Add the string literal to ModifierTargetTypeDTO union above
 * 2. Add the actual type to ModifierTargetType union above
 * 3. Add the mapping entry here
 *
 * Example for adding a new "Item" type:
 * - ModifierTargetTypeDTO = 'Pokemon' | 'PokemonInstanceExt' | 'Item'
 * - ModifierTargetType = Pokemon | PokemonInstanceExt | Item
 * - TargetTypeMap = { Pokemon: Pokemon, PokemonInstanceExt: PokemonInstanceExt, Item: Item } *
 */
export type TargetTypeMap = {
  PokemonInstance: PokemonInstanceExt;
  MemberStrength: MemberStrength;
  TeamMember: TeamMemberExt;
};
